import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import {NgForm, FormBuilder,ReactiveFormsModule,FormGroup} from '@angular/forms';
import { Http,Headers} from '@angular/http';
import {Observable,Subscription} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { NouiFormatter } from 'ng2-nouislider';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SocketService} from './socket-service.service';
declare var $:any;
//var express = require('express'); 
@Component({
  selector: 'app-char-maker',
  templateUrl: './char-maker.component.html',
  styleUrls: ['./char-maker.component.css'],
  providers:[SocketService]
})
export class CharMakerComponent implements OnInit {
  public hideFooter=false;
  public someMin = 1;
  public someLimit = 50;
  public inputRes:any;
  public outputRes:any;
  public sanitizedInput:any;
  public sanitizedOutput:any;
  public inputBaseParam:any;
  public inputHeight:any;
  public inputWeight:any;
  public inputAsian:any;
  public inputAfrican:any;
  public inputCaucasian:any;
  public inputSex:any;
  public outputBaseParam:any;
  public outputHeight:any;
  public outputWeight:any;
  public outputAsian:any;
  public outputAfrican:any;
  public outputCaucasian:any;
  public outputSex:any;
  public inputUrl = "assets/data/input.json";
  public OutputUrl = "assets/data/output.json";
  private FileUploadId:any;
  private processedFiles=[];
  private selectedImage:any={file:"assets/images/object2-png"};
  private bodyParts:any=[];
  private selectedBodyPart:any;
  private changeHistory:any=[];
  private bodyPartImage:any="assets/images/human/human.png"
  constructor(
    private _http: Http,
    private sanitizer: DomSanitizer,
    private socket:SocketService,
  )
  {
    // this.getInput();
    // this.getOutput();
  }
  
  
  public BaseParams: number[] = [0, 1];
  public Height: number[] = [0, 1];
  public Weight: number[] = [0, 1];
  public Asian: number[] = [0, 1];
  public African: number[] = [0, 1];
  public Caucasian: number[] = [0, 1];
  public Sex: number[] = [0, 1];
  someRange2config: any = {
  behaviour: 'drag',
  connect: true,
  margin: 1,
  limit: 5, // NOTE: overwritten by [limit]="10"
  range: {
    min: 0,
    max: 20
    },
    pips: {
      mode: 'steps',
      density: 5
    }
  };

  someKeyboardConfig: any = {
  behaviour: 'drag',
  connect: true,
  start: [0, 3],
  keyboard: true,  // same as [keyboard]="true"
  step: 0.1,
  pageSteps: 10,  // number of page steps, defaults to 10
  range: {
    min: 0.0,
    max: 1.0
  },
  pips: {
    mode: 'count',
    density: 1,
    values: 1,
    stepped: true
  }
};

showMessag(msg:string){
  let d=$("#toasterDiv")[0];
  console.log(d);
    d.innerHTML=msg;
    $("#toasterDiv")[0].style.display="block";

    setTimeout(()=>{$("#toasterDiv")[0].style.display="none"},2000);
    

}
  undo(){
      //undo last changes

      if(this.changeHistory.length >0)
        { this.processedFiles=this.changeHistory.pop();
          this.selectedImage=this.processedFiles[0];

        }
  }


  merge(){

    //input.json from selected Image
    
    let inputVal= Object.assign({},this.selectedImage);

    for(var attr in this.selectedBodyPart){

      inputVal[attr]=0;
    }


    let outputVal=Object.assign({},this.selectedImage,this.selectedBodyPart);

    delete outputVal.file;
    delete inputVal.file;
    
    console.log(inputVal);
    console.log(outputVal);
    const inputjson = JSON.stringify(inputVal);
  const outputjson = JSON.stringify(outputVal);
  
 
    var blobinput = new Blob([inputjson], {type: "application/json"});
  var bloboutput = new Blob([outputjson], {type: "application/json"});
  
  let form: FormData = new FormData();
  form.append("input",blobinput, "input.json");
  form.append("output",bloboutput, "output.json");
  //let headers = new Headers({ 'Content-Type': 'application/json' });
  let headers=new Headers({enctype:'multipart/form-data'});
  var request = new XMLHttpRequest();

  request.onreadystatechange = ()=> {
            if (request.readyState === 4) {
                if (request.status === 200) {
                  console.log("sUCCESS");
                  var d=JSON.parse(request.response);
                    console.log(d);    
                    
               // this.toaster.pop('success',"Char maker ","Files successfully uploaded  ID:"+d.id );
               this.FileUploadId=d.id;  
               this.showMessag("Files successfully uploaded  ID:"+d.id );
              } else {
                  console.log("fAILED");
                  this.showMessag("Failed to upload Files");
        //this.toaster.pop('error',"Char maker ","Failed to upload Files");
                    console.log(request.response);
                }
            }
        }
  request.open(
              "POST",
              "http://localhost:8080/upload"  //replace with the target server which is handling uploads
              //"http://130.211.167.206:2000/upload"
             // "http://192.168.1.114:3000/users/abc"
    ,true
            );
    
  request.send(form);

      


  }

  ngOnInit() {
  	  $(function() {
            setTimeout(function(){
               $(".expand").trigger('click')
            },500);
            $(".expand").on( "click", function() {
              $(this).next().slideToggle(200);
              var $expand = $(this).find(">:first-child");
           
              if($expand.text() == "▼") {
                $expand.text("►");
             } else {
                $expand.text("▼");
             }
           });
      });


      
      this.socket.on('files',(data)=>{


        console.log("Socket Data Received: ");
        console.log(data);
      if(data.id==this.FileUploadId){    
       this.showMessag("Files successfully processed ");
        if(this.processedFiles.length>0)
       this.changeHistory.push(this.processedFiles);
       this.processedFiles=data.files;
       this.selectedImage=data.files[0];

       
      //files received
      //load them in the component
      
      }
    
      });
      

      this.socket.on('error',(data)=>{


        console.log("Socket Data Received: ");
        console.log(data);
        if(data.id==this.FileUploadId)
          this.showMessag(data.msg);
      });

      this.socket.on('bodyPart',(data)=>{

          console.log("Body parts received..");;
          console.log(data);

          this.bodyParts=data;

      });

      this.socket.emit("bodyPart",{part:"head"});


}

//  getInput(){
//          return this._http.get(this.inputUrl)
//            .map(res => res.json())
//            .catch(this.errorHandler)
//            .subscribe(
//             data => {
//               this.inputRes = data;
//               this.inputBaseParam = this.inputRes[0].Input.BaseParam;
//               this.inputHeight = this.inputRes[0].Input.Height;
//               this.inputWeight = this.inputRes[0].Input.Weight;
//               this.inputAsian = this.inputRes[0].Input.Asian;
//               this.inputAfrican = this.inputRes[0].Input.African;
//               this.inputCaucasian = this.inputRes[0].Input.Caucasian;
//               this.inputSex = this.inputRes[0].Input.Sex;
//             },
//             err => {
//                 console.log(err);
//             })
//      }

// getOutput(){
//          return this._http.get(this.OutputUrl)
//            .map(res => res.json())
//            .catch(this.errorHandler)
//            .subscribe(
//             data => {
//               this.outputRes = data; this.outputRes = data;
//               this.outputBaseParam = this.outputRes[0].Output.BaseParam;
//               this.outputHeight = this.outputRes[0].Output.Height;
//               this.outputWeight = this.outputRes[0].Output.Weight;
//               this.outputAsian = this.outputRes[0].Output.Asian;
//               this.outputAfrican = this.outputRes[0].Output.African;
//               this.outputCaucasian = this.outputRes[0].Output.Caucasian;
//               this.outputSex = this.outputRes[0].Output.Sex;
//             },
//             err => {
//                 console.log(err);
//             })
//      }



imageSelected(index:number){
  try{
      this.selectedImage=this.processedFiles[index];
      

  }catch(ex){


  }



}

  saveBaseParamRange(slider,value) {
    //console.log('Value of slider ' + slider + ' changed to', value);

  }

  saveRanges(saveRange:NgForm){
    this.inputRes = 
        {
        Age: this.BaseParams[0],
        Height: this.Height[0],
        Asian: this.Asian[0],
        African: this.African[0],
        gender: this.Sex[0],
        head: this.Weight[0],
        proportions:0.0
	  }
    

this.outputRes = {
        Age: this.BaseParams[1],
        Height: this.Height[1],
        Asian: this.Asian[1],
        African: this.African[1],
        gender: this.Sex[1],
        head: this.Weight[1],
        proportions:0.0
		}
  

  const inputjson = JSON.stringify(this.inputRes);
  const outputjson = JSON.stringify(this.outputRes);
  console.log(inputjson);
  console.log(outputjson);
  var blobinput = new Blob([inputjson], {type: "application/json"});
  var bloboutput = new Blob([outputjson], {type: "application/json"});
  
  let form: FormData = new FormData();
  form.append("input",blobinput, "input.json");
  form.append("output",bloboutput, "output.json");
  //let headers = new Headers({ 'Content-Type': 'application/json' });
  let headers=new Headers({enctype:'multipart/form-data'});
  var request = new XMLHttpRequest();

  request.onreadystatechange = ()=> {
            if (request.readyState === 4) {
                if (request.status === 200) {
                  console.log("sUCCESS");
                  var d=JSON.parse(request.response);
                    console.log(d);    
                    
               // this.toaster.pop('success',"Char maker ","Files successfully uploaded  ID:"+d.id );
               this.FileUploadId=d.id;  
               this.showMessag("Files successfully uploaded  ID:"+d.id );
              } else {
                  console.log("fAILED");
                  this.showMessag("Failed to upload Files");
        //this.toaster.pop('error',"Char maker ","Failed to upload Files");
                    console.log(request.response);
                }
            }
        }
  request.open(
              "POST",
              "http://localhost:8080/upload"  //replace with the target server which is handling uploads
              //"http://130.211.167.206:2000/upload"
             // "http://192.168.1.114:3000/users/abc"
    ,true
            );
    
  request.send(form);

  }


  bodyPartTypeSelected(part:string){

      //fetch the requestd body part
      console.log("fecthcing parts: "+part);


      this.bodyPartImage=`assets/images/human/${part}.png`;
            this.socket.emit("bodyPart",{part:part});

  }
    bodyPartSelected(index:number){
        try{
      this.selectedBodyPart=this.bodyParts.files[index]
        }catch(ex){

        }
    }

   errorHandler(error: Response){
    console.error(error);
    return Observable.throw(error || "Server error");

  }

}
