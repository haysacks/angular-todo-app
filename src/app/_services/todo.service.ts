import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Todo } from '../_models';

@Injectable({ providedIn: 'root' })
export class TodoService {
    private todoSubject: BehaviorSubject<Todo>;
    public todo: Observable<Todo>;

    constructor(
        private http: HttpClient
    ) {
        this.todoSubject = new BehaviorSubject<Todo>(JSON.parse(localStorage.getItem('todo')));
        this.todo = this.todoSubject.asObservable();
    }

    public get todoValue(): Todo {
        return this.todoSubject.value;
    }

    getAll() {
        return this.http.get<Todo[]>(`${environment.apiUrl}/todo/user`);
    }

    getById(id: string) {
        return this.http.get<Todo>(`${environment.apiUrl}/todo/${id}`);
    }

    add(title, isDone, priority, note) {
        const params = {'title': title, 'isDone': isDone, 'priority': priority, 'note': note};
        return this.http.post(`${environment.apiUrl}/todo`, params)
            .pipe(map(todo => {
                localStorage.setItem('todo', JSON.stringify(todo['data']));
                this.todoSubject.next(todo['data']);
                return todo;
            }));
    }

    update(id, title, isDone, priority, note) {
        const params = {'id': id, 'title': title, 'isDone': isDone, 'priority': priority, 'note': note};
        return this.http.put(`${environment.apiUrl}/todo/${id}`, params)
            .pipe(map(x => {
                // update stored todo if the logged in todo updated their own record
                if (id == this.todoValue.id) {
                    // update local storage
                    const todo = { ...this.todoValue, ...params };
                    localStorage.setItem('todo', JSON.stringify(todo));

                    // publish updated todo to subscribers
                    this.todoSubject.next(todo);
                }
                return x;
            }));
    }

    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}/todo/${id}`)
            .pipe(map(x => {
                return x;
            }));
    }
}