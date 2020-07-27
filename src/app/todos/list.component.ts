import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { TodoService } from '../_services';
import { TodoPriority } from '../_models';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    todos = null;
    priorityValues = TodoPriority.getPriorityValues();

    constructor(private todoService: TodoService) {}

    ngOnInit() {
        this.todoService.getAll()
            .pipe(first())
            .subscribe(x => {
                this.todos = x['data'];
            });
    }

    deleteTodo(id: string) {
        const todo = this.todos.find(x => x.id === id);
        todo.isDeleting = true;
        this.todoService.delete(id)
            .pipe(first())
            .subscribe(() => {
                this.todos = this.todos.filter(x => x.id !== id) 
            });
    }
}