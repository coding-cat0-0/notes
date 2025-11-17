import { Component } from '@angular/core';
import { HttpClient, HttpClientModule} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatSnackBar,MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, HttpClientModule, MatSnackBarModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent{
name = '';
email = '';
password = '';


constructor(private http: HttpClient,private snackBar : MatSnackBar){}
OnPopup(message: string) {
  console.log("POPUP TRIGGERED:", message);
  this.snackBar.open(message, 'Close', {
    duration: 3000,
    horizontalPosition: 'center',
    verticalPosition: 'top',
    panelClass: 'neon-snackbar'
  });

}
onSubmit(){
  const emailRegex = /\w+@(\w+\.)?\w+\.(com)$/i;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%&*^_-])[A-Za-z\d!@#$%^&_*-]{8,}$/;

  if(!this.name || !this.email || !this.password){
    return this.OnPopup('Please fill in all fields.');
    return;
  }

  if(!emailRegex.test(this.email)){
    return this.OnPopup ('Please enter a valid email address.');
  }
  if(!passwordRegex.test(this.password)){
    return this.OnPopup('Password must be at least 8 characters long and include one small and one special character.');
  }
  this.http.post('http://localhost:8000/signup', {
    name : this.name,
    email : this.email,
    password : this.password
  }).subscribe({
    next: (response: any) => {
      this.OnPopup(response.message);
    },
    error: (error) => {
      console.log('Error response:', error.error); 
      this.OnPopup(error.error.detail);
    }
});
}
}

//  onSubmit() method is the function that is called when the signup form is submitted and validates.
//  It uses Angular's HttpClient to send a POST request to the backend server with the user's name, email, and password.
//  Based on the server's response, it updates the message and messageColor properties to provide feedback to the user.
//  .subscribe() method handles both success and error responses from the server.

