export class Todo {
    id: number;
    title: string;
    isDone: boolean;
    priority: number;
    note: string;
}

export class TodoPriority {
    static priorityValues = [1, 2, 3];

    static getPriorityValues() {
        return this.priorityValues;
    }
}