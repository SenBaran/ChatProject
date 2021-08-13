import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-loginpage',
  templateUrl: './loginpage.component.html',
  styleUrls: ['./loginpage.component.css']
})
export class LoginpageComponent implements OnInit {

  public username = "";
  public password = "";
  constructor(private hs : HttpService, private router : Router ) { }

  ngOnInit(): void {
  }

  public async checkUser() : Promise<void>{
    if(await this.hs.login(this.username, this.password)){
      this.router.navigate(['/chat']);
    }
  }

}
