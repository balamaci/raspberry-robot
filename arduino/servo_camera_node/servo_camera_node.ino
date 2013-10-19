int ENA=9;
int IN1=7;
int IN2=8;

int ENB=3;
int IN3=2;
int IN4=4;

 
String inData = "";
int horPoz = 0;    // variable to store the servo position 
int vertPoz = 0;

boolean L_EngOn = false;
boolean R_EngOn = false;

boolean L_EngFwd = true;
boolean R_EngFwd = true;

unsigned int motorSpeed = 0;
unsigned int timeMotor = 0;

void setup() 
{ 
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);

  pinMode(ENB, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);

//  horizServo.attach(9);  // attaches the servo on pin 9 to the servo object 
//  vertServo.attach(10);
  
  Serial.begin(19200);
} 
 
 
void loop() 
{
    if(Serial.available()) {
      char recieved = Serial.read();    
      Serial.print(recieved);
            
      if (recieved == '\n') {        
        Serial.print("Received ");
        Serial.println(inData);
        
        if(inData.startsWith("all_eng")) {
          L_EngOn = true;
          L_EngFwd = true;
          
          R_EngOn = true;
          R_EngFwd = true;
          
          timeMotor=0;
          motorSpeed =  inData.substring(7).toInt();
        }
        
        if(inData.startsWith("rev_all_eng")) {
          L_EngFwd = false;
          R_EngFwd = false;
          
          L_EngOn = true;          
          R_EngOn = true;
          
          
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
        Serial.flush();
      } else {
         inData += recieved;          
      }       
    }
    
    if(timeMotor == 0) {
        if(L_EngOn && R_EngOn) {
          startAllEngine();
        }
        else {
          if(L_EngOn) {
            startLeftEngine();
          }   
          if(R_EngOn) {
            startRightEngine();
          } 
        }
    }

    if(L_EngOn || R_EngOn) {
      Serial.print("LE=");
      Serial.print(L_EngOn);

      Serial.print(" RE=");
      Serial.print(R_EngOn);

      Serial.print(" time=");
      Serial.println(timeMotor);
      if(timeMotor >= 500) {
        stopEngines();            
      } else {
          Serial.println(timeMotor);
          delay(100);
          timeMotor += 100;
      }      
    }
}

void startAllEngine() {
  Serial.println("Stopping ALL engines");
  
  if(L_EngFwd && R_EngFwd) {
    digitalWrite(IN1, HIGH);
    digitalWrite(IN2, LOW); 

    digitalWrite(IN3, HIGH);
    digitalWrite(IN4, LOW);
  } else {
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, HIGH);     
    
    digitalWrite(IN3, LOW);
    digitalWrite(IN4, HIGH);    
  }
  analogWrite(ENA, motorSpeed);
  analogWrite(ENB, motorSpeed);
}

void startLeftEngine() {
  Serial.print("startLeft FWD=");
  Serial.println(L_EngFwd);
  
  if(L_EngFwd) {
    digitalWrite(IN1, HIGH);
    digitalWrite(IN2, LOW); 
  } else {
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, HIGH);     
  }
  analogWrite(ENA, motorSpeed);
  Serial.println("started Left");
}

void startRightEngine() {
  Serial.print("startRight FWD=");
  Serial.println(R_EngFwd);
  
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
  Serial.println("Stopping engine");
  digitalWrite(IN1, LOW); 
  digitalWrite(IN2, LOW); 

  digitalWrite(IN3, LOW); 
  digitalWrite(IN4, LOW); 
  
  analogWrite(ENA, 0);
  analogWrite(ENB, 0);
  
  L_EngOn = false;
  R_EngOn = false;

  timeMotor = 1000;  
  Serial.println("Stopped engine");
}
