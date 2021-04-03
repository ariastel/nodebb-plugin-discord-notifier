'use strict';

const discordJS = require('discord.js');

const nconf = require.main.require('nconf');
const winston = require.main.require('winston');
const db = require.main.require('./src/database');
const pubsub = require.main.require('./src/pubsub');
const routeHelpers = require.main.require('./src/routes/helpers');
const socketAdmin = require.main.require('./src/socket.io/admin');


let settings = {
  token: undefined,
  hooks: []
};
let discordClient = null;

const Plugin = {};

Plugin.init = async function (params) {
  routeHelpers.setupAdminPageRoute(params.router, '/admin/plugins/discord-notifier', params.middleware, [], renderAdmin);
  settings = await getSettings();
  await checkBotSettings(settings.token);
};

Plugin.onHookFired = async function (hookData) {
  for (const hook of settings.hooks) {
    if (hook.channelId && hook.name === hookData.hook) {
      try {
        await makeRequest(hook.channelId, hook.template, hookData);
      } catch (e) {
        winston.error(`[discord-notifier] - error with processing a request for hook ${hook.name}! ${e}`);
      }
    }
  }
};

Plugin.addAdminNavigation = async function (custom_header) {
  custom_header.plugins.push({
    route: '/plugins/discord-notifier',
    icon: 'fa-chart-bar',
    name: 'Discord Notifier',
  });
  return custom_header;
};

socketAdmin.plugins['discord-notifier'] = {};
socketAdmin.plugins['discord-notifier'].save = async function (socket, data) {
  await db.set('nodebb-plugin-discord-notifier', JSON.stringify(data));
  settings = data;
  await checkBotSettings(settings.token);
  pubsub.publish('nodebb-plugin-discord-notifier:save', data);
};

pubsub.on('nodebb-plugin-discord-notifier:save', async function (data) {
  settings = data;
  await checkBotSettings(settings.token);
});

module.exports = Plugin;

async function renderAdmin(req, res, next) {
  try {
    const settings = await getSettings();
    res.render('admin/plugins/discord-notifier', settings);
  } catch (err) {
    next(err);
  }
}

async function makeRequest(channelId, template, hookData) {
  if (!discordClient) {
    winston.error('[discord-notifier] - discord was not initialized!');
    return;
  }

  const parsedTemplate = parseTemplate(template, hookData);
  const jsonTemplate = JSON.parse(parsedTemplate);

  const message = new discordJS.MessageEmbed(jsonTemplate).setTimestamp();
  await discordClient.api
    .channels(channelId)
    .messages
    .post({ data: { embed: message.toJSON() } });
}

async function getSettings() {
  try {
    const data = await db.get('nodebb-plugin-discord-notifier');
    return JSON.parse(data) || { token: null, hooks: [] };
  } catch (e) {
    winston.error(`[discord-notifier] - can't get settings! ${e}`);
    return { token: null, hooks: [] };
  }
}

async function checkBotSettings(token) {

  token = token || process.env.DISCORD_NOTIFIER_TOKEN;
  if (!token || (discordClient && discordClient.token === token)) {
    return;
  }

  if (discordClient) {
    discordClient.destroy();
  }

  discordClient = new discordJS.Client();
  discordClient.token = token;
}

function parseTemplate(template = '', hookData = {}) {

  const regExp = new RegExp(/\{([\w\d.\-_]*)\}/, 'g');
  if (!regExp.test(template)) {
    return template;
  }

  let result = template;
  const set = new Set();
  for (const match of template.matchAll(regExp)) {

    const token = match[1];
    if (set.has(token)) {
      continue;
    }
    set.add(token);

    let tokenData = hookData;
    if (token === 'const.url') {
      tokenData = nconf.get('url');
    } else {
      for (const part of token.split('.')) {
        tokenData = tokenData[part];
      }
    }

    result = result.replace(new RegExp(`{${token}}`, 'g'), tokenData);
  }

  return result;
}