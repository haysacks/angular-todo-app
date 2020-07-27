import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../_models';

@Injectable({ providedIn: 'root' })
export class AccountService {
    private userSubject: BehaviorSubject<User>;
    public user: Observable<User>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
        this.user = this.userSubject.asObservable();
    }

    public get userValue(): User {
        return this.userSubject.value;
    }

    login(email, password) {
        const params = {'email': email, 'password': password};
        return this.http.post<User>(`${environment.apiUrl}/auth/login`, params)
            .pipe(map(user => {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    const token = user['data']['token'];
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    this.userSubject.next(user);
                    return user;
                }),
                catchError(err => {
                    throw new Error("E-mail or password is incorrect");
                })
            );
    }

    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('user');
        this.userSubject.next(null);
        this.router.navigate(['/account/login']);
        localStorage.removeItem('token');
    }

    register(username, email, password) {
        const params = {'name': username, 'email': email, 'password': password};
        return this.http.post(`${environment.apiUrl}/auth/register`, params)
            .pipe(catchError(err => {
                    throw new Error('The e-mail "' + email + '" is already taken');
                })
            );
    }
}