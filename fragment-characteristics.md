1. Fragment characteristics: 
- all fragments have same FPS, 
- likely same resolution but what happens if they difer?
- What does it mean "can fragments be missing?"
- what does it mean "Is order guaranteed or inferred?"? If the question means how fragments come in the array is their order in the timeline, then yes.

2. Duration strategy:
- explain the difference between exact playback and trimmed clips. I will give more info though: fragments are likely 10-20 seconds long. Actually that depends on the recording configuration from the app that recordsthe video fragments, I have no control over this, they video fragments will come from another source.
- regarding timelapse, I was asking if it's achievable with remotion in case they want one or more of the fragments to apply a timelapse effect

3. Intro requirements:
- Will likely be fixed duration per template
- For now I only know it will include the student name, the class name. But I want it to be extensible in case more studen or class details want to be added to the intro.
- Also, I'm pretty sure the logo of the brand will be added to some part of the intro.

4. Outro: 
- Always same file and duration, at least per template

5. Expected scale:
- Can't answer how many videos per day honestly. But a rough estimate would be: usually 3 video fragments per class. Assume around 6 classes a day given different instructors, this results in 6 total video outputs (rendered result).
- In case they want dynamic video duration based on the intro + fragments + outro can this be achieved? Or is it strictly necessary to set a fixed duration for the timeline? Because I don't know if fragments will have a different duration, but a rough estimate is that they will either be 15 or 20 seconds each fragment.
- One render at a time preferably. They will be queued.

6. Fragment source:
- Fragments will be created on each class session. Let me know if that answers the questions already "preprocessed? or raw uploads?", otherwise clarify the question so I can answer properly.

7. Failure tolerance:
- if one fragment is is missing it is better to fail the current render (but obviously not the queue or worker right?)