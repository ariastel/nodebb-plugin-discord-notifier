<div class="row">
	<div class="col-lg-12">
		<h4>Bot settings</h4>
		<p>Get token <a target="_blank" href="https://discord.com/developers/applications">here</a></p>
		<input class="token form-control" id="discord-token" value="{token}" />
	</div>
</div>
<div class="row">
	<div class="col-lg-12">
		<h4>Notifications</h4>
		<p>Click <a target="_blank" href="https://github.com/NodeBB/NodeBB/wiki/Hooks">here</a> for available hooks.</p>
		<div class="table-responsive">
			<table class="table table-striped">
				<thead>
					<tr>
						<th>Hook Name</th>
						<th>Channel ID</th>
						<th></th>
					</tr>
				</thead>
				<tbody id="hooks-parent">
					<!-- BEGIN hooks -->
					<tr>
						<td class="col-md-3">
							<input class="hook-name form-control" value="{hooks.name}" />
						</td>
						<td class="col-md-3">
							<input class="hook-channelId form-control" type="number" value="{hooks.channelId}" />
						</td>
						<td class="col-md-5">
							<textarea class="hook-template form-control">{hooks.template}</textarea>
						</td>
						<td class="col-md-1">
							<button class="hook-remove btn btn-danger">Remove</button>
						</td>
					</tr>
					<!-- END hooks -->
				</tbody>
			</table>
		</div>
		<div class="pull-right">
			<button id="add-hook" class="btn btn-success"><i class="fa fa-plus"></i> Add Hook</button>
			<button id="save" class="btn btn-success"><i class="fa fa-save"></i> Save</button>
		</div>
	</div>
</div>