import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AlertService, TodoService } from '../_services';
import { TodoPriority } from '../_models';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form: FormGroup;
    id: string;
    isAddMode: boolean;
    loading = false;
    submitted = false;
    priorityValues = TodoPriority.getPriorityValues();

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private todoService: TodoService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;

        this.form = this.formBuilder.group({
            title: ['', Validators.required],
            isDone: [false],
            priority: [this.priorityValues[2], Validators.required],
            note: ['', Validators.required]
        });

        // edit mode retain previous values
        if (!this.isAddMode) {
            this.todoService.getById(this.id)
                .pipe(first())
                .subscribe(x => {
                    const params = x['data'];
                    this.f.title.setValue(params['title']);
                    this.f.isDone.setValue(params['isDone']);
                    this.f.priority.setValue(params['priority']);
                    this.f.note.setValue(params['note']);
                });
        }
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        if (this.isAddMode) {
            this.createTodo();
        } else {
            this.updateTodo();
        }
    }

    private createTodo() {
        this.todoService.add(this.f.title.value, this.f.isDone.value, this.f.priority.value, this.f.note.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.alertService.success('Todo added successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['.', { relativeTo: this.route }]);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }

    private updateTodo() {
        this.todoService.update(this.id, this.f.title.value, this.f.isDone.value, this.f.priority.value, this.f.note.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.alertService.success('Update successful', { keepAfterRouteChange: true });
                    this.router.navigate(['..', { relativeTo: this.route }]);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
}