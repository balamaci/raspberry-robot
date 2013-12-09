int ENA=9;
int IN1=2;
int IN2=4;

int ENB=10;
int IN3=7;
int IN4=8;


String inData = "";
int horPoz = 0;    // variable to store the servo position 
int vertPoz = 0;

volatile boolean L_EngOn = false;
volatile boolean R_EngOn = false;

volatile boolean L_EngFwd = true;
volatile boolean R_EngFwd = true;

volatile unsigned int motorSpeed = 0;
volatile unsigned int timeLeftMotor = 0;
volatile unsigned int timeRightMotor = 0;

volatile unsigned int timeToRun = 1500;


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

      stopCommanded = false;
      timeToRun = 1500;

      if(inData.startsWith("stop")) {
         stopCommanded = true;
      }

      if(inData.startsWith("all_eng")) {
        L_EngOn = true;
        L_EngFwd = true;

        R_EngOn = true;
        R_EngFwd = true;

        timeRightMotor=0;
        timeLeftMotor=0;
        motorSpeed =  inData.substring(7, 10).toInt();
        if(inData.length() > 11) {
            timeToRun = inData.substring(11);
        }
      }

      if(inData.startsWith("rev_all_eng")) {
        L_EngFwd = false;
        R_EngFwd = false;

        L_EngOn = true;          
        R_EngOn = true;


        timeRightMotor=0;
        timeLeftMotor=0;

        motorSpeed =  inData.substring(11, 14).toInt();
        if(inData.length() > 15) {
            timeToRun = inData.substring(15);
        }
      }

      if(inData.startsWith("reng")) {
        R_EngOn = true;
        R_EngFwd = true;

        timeRightMotor=0;
        timeLeftMotor=0;

        motorSpeed =  inData.substring(4, 7).toInt();
        if(inData.length() > 8) {
            timeToRun = inData.substring(8);
        }
      }

      if(inData.startsWith("rev_reng")) {
        R_EngOn = true;
        R_EngFwd = false;

        timeRightMotor=0;
        timeLeftMotor=0;

        motorSpeed =  inData.substring(8).toInt();
      }

      if(inData.startsWith("leng")) {
        L_EngOn = true;
        L_EngFwd = true;

        timeRightMotor=0;
        timeLeftMotor=0;

        motorSpeed =  inData.substring(4).toInt();
      }

      if(inData.startsWith("rev_leng")) {
        L_EngOn = true;
        L_EngFwd = false;

        timeRightMotor=0;
        timeLeftMotor=0;

        motorSpeed =  inData.substring(8).toInt();
      }

      inData = ""; //clear previous message
      Serial.flush();
    } 
    else {
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
    if(timeMotor >= timeToRun || stopCommanded) {
      stopEngines();            
    } 
    else {
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
  } 
  else {
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
  } 
  else {
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
  } 
  else {
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

  timeMotor = 1500;  
  Serial.println("Stopped engine");
}

