#include <Servo.h> 
 
Servo horizServo;  
Servo vertServo;

int ENA=3;
int IN1=2;
int IN2=4;

int ENB=5;
int IN3=7;
int IN4=8;

 
String inData = "";
int horPoz = 0;    // variable to store the servo position 
int vertPoz = 0;

int L_EngOn = false;
int R_EngOn = false;

int L_EngFwd = true;
int R_EngFwd = true;

int motorSpeed = 0;
unsigned int timeMotor = 0;

void setup() 
{ 
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);

  pinMode(ENB, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);

  horizServo.attach(9);  // attaches the servo on pin 9 to the servo object 
  vertServo.attach(10);
  
  Serial.begin(4800);
} 
 
 
void loop() 
{ 
    while (Serial.available()) {
      //Serial.print("A");
      char recieved = Serial.read();    
            
      if (recieved == '*') {        
        if(inData.startsWith("hcam")) {
          horPoz =  inData.substring(4).toInt();
          horizServo.write(horPoz);
        }
        if(inData.startsWith("vcam")) {
          vertPoz =  inData.substring(4).toInt();
          vertServo.write(vertPoz);
        }

//        Serial.print("Received ");
//        Serial.println(inData);
        
        if(inData.startsWith("all_eng")) {
          L_EngOn = true;
          R_EngOn = true;
          timeMotor=0;
          motorSpeed =  inData.substring(7).toInt();
        }
        
        if(inData.startsWith("rev_all_eng")) {
          L_EngOn = true;
          L_EngFwd = false;
          
          R_EngOn = true;
          R_EngFwd = false;
          
          timeMotor=0;
          motorSpeed =  inData.substring(11).toInt();
        }
        
        if(inData.startsWith("reng")) {
          R_EngOn = true;
          R_EngFwd = true;

          timeMotor=0;
          motorSpeed =  inData.substring(4).toInt();
        }
        
        if(inData.startsWith("rev_reng")) {
          R_EngOn = true;
          R_EngFwd = false;

          timeMotor=0;
          motorSpeed =  inData.substring(8).toInt();
        }
        
        if(inData.startsWith("leng")) {
          L_EngOn = true;
          L_EngFwd = true;
          
          timeMotor=0;
          motorSpeed =  inData.substring(4).toInt();
        }
        
        if(inData.startsWith("rev_leng")) {
          L_EngOn = true;
          L_EngFwd = false;
          
          timeMotor=0;
          motorSpeed =  inData.substring(8).toInt();
        }
        
        inData = ""; //clear previous message
        
      } else {
        //Serial.print("R");Serial.print(recieved);
         inData += recieved;          
      }  
    }
    
    if(timeMotor == 0) {
        if(L_EngOn) {
          startLeftEngine();
        } 
        if(R_EngOn) {
          startRightEngine();
        } 
    }

    if(L_EngOn || R_EngOn) {
//      Serial.print("LE");
//      Serial.print(L_EngOn);
//      Serial.print("RE");
//      Serial.print(R_EngOn);
//      Serial.print(" motor");
//      Serial.println(timeMotor);
      
      if(timeMotor > 500) {
        stopEngines();            
      } else {
          delay(100);
          timeMotor += 100;
      }      
    }
    
//    Serial.print('Indata ' + inData);
}

void startLeftEngine() {
  //Serial.print("startLeft ");
  //Serial.println(R_EngFwd);
  
  if(L_EngFwd) {
    digitalWrite(IN1, HIGH);
    digitalWrite(IN2, LOW); 
  } else {
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, HIGH);     
  }
  analogWrite(ENA, motorSpeed);
}

void startRightEngine() {
  //Serial.print("startRight ");
  //Serial.print(R_EngFwd);
  
  if(R_EngFwd) {
    digitalWrite(IN3, HIGH);
    digitalWrite(IN4, LOW);
  } else {
    digitalWrite(IN3, LOW);
    digitalWrite(IN4, HIGH);    
  }
  
  analogWrite(ENB, motorSpeed);
}

void stopEngines() {  
  //Serial.println("Stoping engine");
  digitalWrite(IN2, LOW); 
  digitalWrite(IN4, LOW); 
  
  analogWrite(ENA, 0);
  analogWrite(ENB, 0);
  
  L_EngOn = false;
  R_EngOn = false;

  timeMotor = 0;
}