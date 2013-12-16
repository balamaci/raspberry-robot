raspberry-robot
===============

A responsive UI for controlling a robot vehicle through the browser interface working ok on phones and tablets.
Serving the html from nodejs express framework and sending the commands through websockets(socket.io).


Smooth controls
---------------
4 control directions: Right, Left, Forward, Back for steering and one knob for changing the speed.



Preset Path Mode - aka Mars Curiosity Mode
-------------------

I though it will be nice to control my rover by executing some 'high level' actions like go 'forward 2 m', 'turn left 90 deg'.
'forward 70 cm', 'turn right 50 deg'.

The Mars Curiosity rover cannot be controlled in realtime. It takes between 4-24 min max for a signal to travel from
Earth to Mars so an entire preset path must be uploaded to Curiosity.



This control panel lets you create your own path by using basic path commands that are executed one after the other.

- Forward / Back  ...  cm / m
- Left / Right    ...  deg

You can even return it to the starting point by running the commands in reverse.


Right now there is a naive implementation in the backend to just keep the motors running for a number of milliseconds
the sense that I don't have any feedback on the actual travelled distance