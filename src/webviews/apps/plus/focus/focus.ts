import type { PullRequestShape } from '../../../../git/models/pullRequest';
import type { State } from '../../../../plus/webviews/focus/protocol';
import {
	DidChangeNotificationType,
	OpenBranchCommandType,
	OpenWorktreeCommandType,
	SwitchToBranchCommandType,
} from '../../../../plus/webviews/focus/protocol';
import type { IpcMessage } from '../../../protocol';
import { onIpc } from '../../../protocol';
import { App } from '../../shared/appBase';
import { DOM } from '../../shared/dom';
import type { GlFocusApp } from './components/focus-app';
import type { GkPullRequestRow } from './components/gk-pull-request-row';
import './components/focus-app';
import './focus.scss';

export class FocusApp extends App<State> {
	constructor() {
		super('FocusApp');
	}

	override onInitialize() {
		this.attachState();
	}

	protected override onBind() {
		const disposables = super.onBind?.() ?? [];

		disposables.push(
			DOM.on<GkPullRequestRow, PullRequestShape>(
				'gk-pull-request-row',
				'open-worktree',
				(e, target: HTMLElement) => this.onOpenWorktree(e, target),
			),
			DOM.on<GkPullRequestRow, PullRequestShape>('gk-pull-request-row', 'open-branch', (e, target: HTMLElement) =>
				this.onOpenBranch(e, target),
			),
			DOM.on<GkPullRequestRow, PullRequestShape>(
				'gk-pull-request-row',
				'switch-branch',
				(e, target: HTMLElement) => this.onSwitchBranch(e, target),
			),
		);

		return disposables;
	}

	private _component?: GlFocusApp;
	private get component() {
		if (this._component == null) {
			this._component = (document.getElementById('app') as GlFocusApp)!;
		}
		return this._component;
	}

	attachState() {
		this.component.state = this.state;
	}

	private onOpenBranch(e: CustomEvent<PullRequestShape>, _target: HTMLElement) {
		if (e.detail?.refs?.head == null) return;
		this.sendCommand(OpenBranchCommandType, { pullRequest: e.detail });
	}

	private onSwitchBranch(e: CustomEvent<PullRequestShape>, _target: HTMLElement) {
		if (e.detail?.refs?.head == null) return;
		this.sendCommand(SwitchToBranchCommandType, { pullRequest: e.detail });
	}

	private onOpenWorktree(e: CustomEvent<PullRequestShape>, _target: HTMLElement) {
		if (e.detail?.refs?.head == null) return;
		this.sendCommand(OpenWorktreeCommandType, { pullRequest: e.detail });
	}

	protected override onMessageReceived(e: MessageEvent) {
		const msg = e.data as IpcMessage;
		this.log(`onMessageReceived(${msg.id}): name=${msg.method}`);

		switch (msg.method) {
			case DidChangeNotificationType.method:
				onIpc(DidChangeNotificationType, msg, params => {
					this.state = params.state;
					this.setState(this.state);
					this.attachState();
				});
				break;
		}
	}
}

new FocusApp();
