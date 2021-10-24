## Inspiration
The Covid-19 pandemic has only brought more students studying and professionals working from home. Covid caused a twist which made everything to switch to Online mode and this change is going to continue even after covid. From Classes to Work everything has become online. Most of us spend hours in front of the computer which is not only counter-productive for long hours of time, but it's extremely dangerous for one's health. And this fact is very well undetermined...

We thought about ways in which we can work on our physical health, and the first thing that popped into our heads was posture. Bad posture not only causes short-term discomfort but also has a long-term impact on the bones and muscles. It is the leading cause of Postural Dysfunction which is a long-term and painful disease, and Recently the number of students experiencing it has drastically increased. With the onset of the new semester the cases will rise up again that's why we came up with an idea to counter-tackle bad posture and avoid an unwanted disease before its too late...

## What it does
PostureVision is an Deep Learning-based app that uses your webcam and monitors your posture in real-time in your browser, and sends notifications/alerts your way each time it detects poor posture. It also gives you real-time feedback about the quality of your posture and displays measurements for users that love detailed reports. PostureVision would be the best buddy to a student who is working a lot with computers/laptops and is careful about his health.


## How we built it

1. For the frontend we used HTML/CSS and React JS. We used the react-webcam package to send and show live webcam video feed to the ML model. We also used React Notifier package to make real-time notifications for browsers. We also used React JS in the backend and made a custom API to establish communication between the ML model and the backend which supports real-time image transfer

2. We used OpenCV and TensorFlow's PoseNet API on top of custom-coded complex algorithms that enhance the detection power of the model. We then integrated this model with the backend.

## Challenges we ran into
1. Initially, we were experimenting with a couple of models using TensorFlow (in Python), but it became too complicated (both on us as well as on the server) to handle and process data points in real-time between the frontend and the backend. We finally settled on using TensorFlow JS' PoseNet API to track data points in the browser, in real-time. We optimized for maximum performance.

2. Lack of initial teammates - We didnt get teammates until the mid of the hackathon but we got one finally. Team hunting hurt us pretty bad in terms of time.


## What we learned
We learned a ton of new stuff that we've never come across before. Things like tracking and calculating an object's position and orientation in 3D space with data inputs. We also learned about handling video streams with JavaScript in the browser. Perfected are React Skills and developed extensive knowledge of node packages. Working for the first time with PoseNet API was pretty hard, but learned a lot. Team coordination skills - A ton

## What's next for PostureVision
We'd like to have PostureVision deployed on a much larger scale. We'd initially have to work on more well-rounded features (such as real-time graphs) to monitor progress over a period of time and provide more comprehensive reports. Include a focus prediction by facial emotions and hosting the app online as a service
