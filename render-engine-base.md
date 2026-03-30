8) Questions I need you to answer before proceeding

These directly affect architecture decisions.

1. Fragment characteristics
Are all fragments:
same resolution?
same FPS?
Can fragments be missing?
Is order guaranteed or inferred?
2. Duration strategy
Do you want:
exact playback (full clip)
trimmed clips
sped up (timelapse)?
3. Intro requirements
Fixed duration or dynamic?
Only text (student name) or more data?
4. Outro
Always same file?
Fixed duration?
5. Expected scale (important for queue design)
Videos per day?
Average video length?
Concurrent renders?
6. Fragment source
Are fragments:
already preprocessed?
raw uploads?
7. Failure tolerance
If one fragment is missing:
fail render?
skip fragment?