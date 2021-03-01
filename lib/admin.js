/* globals app, $, socket, define */

'use strict';

define('admin/plugins/discord-notifier', function () {
  var DiscordNotifier = {};

  DiscordNotifier.init = function () {
    $('#add-hook').on('click', function () {
      app.parseAndTranslate('admin/plugins/discord-notifier', 'hooks', { hooks: [{ name: 'action:**.**', channelId: 0, template: '' }] }, function (html) {
        $('#hooks-parent').append(html);
      });
    });

    $('#save').on('click', function () {
      var data = { token: null, hooks: [] };
      data.token = $('#discord-token').val();
      $('#hooks-parent tr').each(function () {
        data.hooks.push({
          name: $(this).find('.hook-name').val(),
          channelId: $(this).find('.hook-channelId').val(),
          template: $(this).find('.hook-template').val()
        });
      });
      socket.emit('admin.plugins.discord-notifier.save', data, function (err) {
        if (err) {
          return app.alertError(err);
        }
        app.alertSuccess('Hooks Saved!');
      });
    });

    $('#hooks-parent').on('click', '.hook-remove', function () {
      $(this).parent().parent().remove();
    });
  };

  return DiscordNotifier;
});