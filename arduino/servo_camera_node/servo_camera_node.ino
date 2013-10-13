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

int motorSpeed = 0;
int timeMotor = 0;

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
  
  Serial.begin(9600);
} 
 
 
void loop() 
{ 
    while (Serial.available()) {
      char recieved = Serial.read();    
            
      if (recieved == '*') {        
        if(inData.startsWith("hcam")) {
//          Serial.print("Poz " + inData + " - " + inData.substring(4));
          horPoz =  inData.substring(4).toInt();
          horizServo.write(horPoz);
        }
        if(inData.startsWith("vcam")) {
          vertPoz =  inData.substring(4).toInt();
          vertServo.write(vertPoz);
        }
        if(inData.startsWith("all_eng")) {
          L_EngOn = true;
          R_EngOn = true;
          timeMotor=0;
          motorSpeed =  inData.substring(7).toInt();
        }
        if(inData.startsWith("reng")) {
          R_EngOn = true;
          timeMotor=0;
          motorSpeed =  inData.substring(4).toInt();
        }
        if(inData.startsWith("leng")) {
          L_EngOn = true;
          timeMotor=0;
          motorSpeed =  inData.substring(4).toInt();
        }
        
        inData = ""; //clear previous message
        
      } else {
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
      if(timeMotor > 1000) {
        stopEngines();            
      } else {
          delay(100);
          timeMotor += 100;
      }      
    }
    
//    Serial.print('Indata ' + inData);
}

void startLeftEngine() {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW); 
  
  analogWrite(ENA, motorSpeed);
}

void startRightEngine() {
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  
  analogWrite(ENB, motorSpeed);
}

void stopEngines() {
  L_EngOn = false;
  R_EngOn = false;
  
  digitalWrite(IN2, LOW); 
  digitalWrite(IN4, LOW); 
  
  analogWrite(ENA, 0);
  analogWrite(ENB, 0);
  
  timeMotor = 0;
}
