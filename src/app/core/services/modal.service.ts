import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ConfirmOptions {
	title?: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
}

export interface PromptOptions {
	title?: string;
	message?: string;
	placeholder?: string;
	confirmText?: string;
	cancelText?: string;
}

export type ModalType = 'confirm' | 'prompt' | 'custom';

export interface ModalRequest {
	id: string;
	type: ModalType;
	options?: ConfirmOptions | PromptOptions | any;
	// subject used by modal host to push back responses
	responseSubject: Subject<any>;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
	private requestsSubject = new Subject<ModalRequest>();
	public requests: Observable<ModalRequest> = this.requestsSubject.asObservable();

	private createRequest<T = any>(type: ModalType, options?: any): Promise<T> {
		const id = Math.random().toString(36).slice(2, 9);
		const responseSubject = new Subject<any>();
		const req: ModalRequest = { id, type, options, responseSubject };

		this.requestsSubject.next(req);

		return new Promise<T>((resolve) => {
			const sub = responseSubject.subscribe((value) => {
				resolve(value as T);
				sub.unsubscribe();
			});
		});
	}

	// Promise-based API that will dispatch requests to any modal host in the app
	confirm(options: ConfirmOptions): Promise<boolean> {
		return this.createRequest<boolean>('confirm', options);
	}

	prompt(options: PromptOptions): Promise<string | null> {
		return this.createRequest<string | null>('prompt', options);
	}
}

