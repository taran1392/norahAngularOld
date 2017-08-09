import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Component, OnInit,OnChanges,SimpleChange,SimpleChanges } from '@angular/core';
import {NgForm, FormBuilder,ReactiveFormsModule,FormGroup} from '@angular/forms';
import { Http,Headers} from '@angular/http';
import {Observable,Subscription} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { NouiFormatter } from 'ng2-nouislider';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SocketService} from './SocketService';
import {GeneratedImages} from './data-model';

declare var $:any;
@Component({
  selector: 'app-dna-code',
  templateUrl: './dna-code.component.html',
  styleUrls: ['./dna-code.component.css'],
  providers:[SocketService]
})
export class DnaCodeComponent implements OnInit,OnChanges {
 
  public hideFooter=false;
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
  private processedFiles:GeneratedImages;
  private selectedImage:any={file:"assets/images/object2-png"};
  private bodyParts:any=[];
  private selectedBodyPart:any;
  private changeHistory:Array<GeneratedImages>=[];
  private bodyPartImage:any="assets/images/human/human.png"
  

  
  private oldEthinicVal={

       asian:[6, 2],
   african: [3, 3],
   caucasian: [1, 5],

  }

  
  public BaseParams: number[] = [0, 10];
  public Height: number[] = [0, 10];
  public Weight: number[] = [0, 10];
  public Muscle: number[] = [0, 10];
  public Proportion: number[] = [0, 10];
  public Asian: number[] = [6, 8];
  public African: number[] = [3, 7];
  public Caucasian: number[] = [1, 5];
  public Sex: number[] = [0, 10];
  public Age: number[] = [0, 10];
  public someMin = 1;
  public someLimit = 50;
  someValue= [ 2, 10 ];
  someRange= [ 2, 10 ];
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
  start: [0, 9],
  keyboard: true,  // same as [keyboard]="true"
  step: 0.1,
  pageSteps: 10,  // number of page steps, defaults to 10
  range: {
    min: 0,
    max: 10
  },
  pips: {
    mode: 'count',
    density: 1,
    values: 1,
    stepped: true
  }
};
  constructor(
    private _http: Http,
    private sanitizer: DomSanitizer,
    private socket:SocketService,
  )
  {
    // this.getInput();
    // this.getOutput();
  }

  ngOnChanges(changes:SimpleChanges){
      console.log("change");

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
      //if(data.id==this.FileUploadId){    
       this.showMessag("Files successfully processed ");

        if(this.processedFiles){
       //this.changeHistory.push(this.processedFiles);
       this.processedFiles=new GeneratedImages(data.id,"part:"+this.bodyParts.part,"",data.files);
       this.selectedImage=data.files[7];
        }else{

           this.processedFiles=new GeneratedImages(data.id,"generation 1","",data.files);
          this.selectedImage=data.files[7];
        
       }

       this.changeHistory.push(this.processedFiles);

       
      //files received
      //load them in the component
      
      
    
      });
      

      this.socket.on("info",(data)=>{

        console.log("info from server");
        console.log(data);

        this.showMessag(data.msg);
      });
      this.socket.on('errorInfo',(data)=>{


        console.log("Socket Error Data Received: ");
        console.log(data);
        //if(data.id==this.FileUploadId)
          this.showMessag(data.msg);
      });

      this.socket.on('bodyPart',(data)=>{

          console.log("Body parts received..");;
          console.log(data);

          this.bodyParts=data;

      });

      this.socket.emit("bodyPart",{part:"head"});


  }

  switchImage(id:string){

    console.log("Switching image to:"+id);
    console.log(this.processedFiles);
      this.changeHistory=this.changeHistory.map((gen)=>{

        if(gen.id==id){
          gen.setActive();
          this.processedFiles=gen;
          this.selectedImage=gen.files[7];
        }else{
            gen.setActive(false);

        }
          return gen;
      });

console.log(this.processedFiles);

  }

  generateImage(){

    if(this.processedFiles&&this.selectedBodyPart){

      this.merge();
    }else{

        //generate generation 1
        this.saveRanges(null);
    }
  }

  showMessag(msg:string){
  let d=$("#toasterDiv")[0];
  //console.log(d);
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
  
 //send via socket

 this.sendValues(inputVal,outputVal);
    

  }

imageSelected(index:number){
  try{
      this.selectedImage=this.processedFiles.files[index];
      

  }catch(ex){


  }



}



  scrollLeft(){

        var view = $(".scroller-content");
        var move = "250px";
        var sliderLimit = -250;


   
    var currentPosition = parseInt(view.css("left"));
    if (currentPosition < 0) view.stop(false,true).animate({left:"+="+move},{ duration: 400});


  }

  scrollRight(){

    var view = $(".scroller-content");
var move = "250px";
var sliderLimit = -250;


    var currentPosition = parseInt(view.css("left"));
    if (currentPosition >= sliderLimit)
       view.stop(false,true).animate({left:"-="+move},{ duration: 400})


  }


  saveBaseParamRange(slider,value,sobj) {
    console.log('Value of slider ' + slider + ' changed to', value);
console.log(sobj);
if(slider=="asian"){

  let dx1= value[0]-this.oldEthinicVal.asian[0];

  let dx2= value[1]-this.oldEthinicVal.asian[1];
  this.oldEthinicVal.asian=value;

  let val:any=[this.Caucasian[0]-(dx1/2.0),this.Caucasian[1]-(dx2/2.0)];
  this.Caucasian=val;
let val2:any=[this.African[0]-(dx1/2.0),this.African[1]-(dx2/2.0)];
  this.African=val;



}


if(slider=="african"){

  let dx1= value[0]-this.oldEthinicVal.african[0];

  let dx2= value[1]-this.oldEthinicVal.african[1];
  this.oldEthinicVal.african =value;

  let val:any=[this.Caucasian[0]-(dx1/2.0),this.Caucasian[1]-(dx2/2.0)];
  this.Caucasian=val;
let val2:any=[this.Asian[0]-(dx1/2.0),this.Asian[1]-(dx2/2.0)];
  this.Asian=val;



}

if(slider=="caucasian"){

  let dx1= value[0]-this.oldEthinicVal.caucasian [0];

  let dx2= value[1]-this.oldEthinicVal.caucasian  [1];
  this.oldEthinicVal.caucasian =value;

  let val:any=[this.African [0]-(dx1/2.0),this.African [1]-(dx2/2.0)];
  this.African =val;
let val2:any=[this.Asian[0]-(dx1/2.0),this.Asian[1]-(dx2/2.0)];
  this.Asian=val;



}


  }

  saveRanges(saveRange:NgForm){

    this.inputRes = 
        { 
        "macrodetails/Age": this.Age[0]/10,
        "macrodetails-height/Height": this.Height[0]/10,
        "macrodetails/Gender": this.Sex[0]/10,
        "macrodetails-universal/Weight": this.Weight[0]/10,
        "macrodetails-proportions/BodyProportions":this.Proportion[0]/10,
        "macrodetails-universal/Muscle ":this.Muscle[0]/10,
        "macrodetails/Asian": this.Asian[0]/10,
        "macrodetails/African": this.African[0]/10,
        "macrodetails/Caucasian": this.Caucasian[0]/10
      }
    

this.outputRes = {
         
        "macrodetails/Age": this.Age[1]/10,
        "macrodetails-height/Height": this.Height[1]/10,
        "macrodetails/Gender": this.Sex[1]/10,
        "macrodetails-universal/Weight": this.Weight[1]/10,
        "macrodetails-proportions/BodyProportions":this.Proportion[1]/10,
        "macrodetails-universal/Muscle ":this.Muscle[1]/10,
        "macrodetails/Asian": this.Asian[1]/10,
        "macrodetails/African": this.African[1]/10,
        "macrodetails/Caucasian": this.Caucasian[1]/10
      }
    
    this.sendValues(this.inputRes,this.outputRes);

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
  /*request.open(
              "POST",
              "http://localhost:8080/upload"  //replace with the target server which is handling uploads
              //"http://130.211.167.206:2000/upload"
             // "http://192.168.1.114:3000/users/abc"
    ,true
            );
    */
  //request.send(form);

  }

  sendValues(inputValues,outputValues){

  this.socket.emit("upload",{inputValues:inputValues,outputValues:outputValues},(err)=>{



    console.log("upload request sent");
    console.log(err);
  });
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

  onChange(value: any) {
    console.log('Value changed to', value);
  }





}
 