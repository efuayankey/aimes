import { CBTTopic } from '../types/CBTTraining';

export const CBT_OVERVIEW = {
  title: 'Cognitive Behavioral Therapy (CBT) Training',
  description:
    'CBT is an evidence-based approach that helps clients identify and change unhelpful thinking patterns, emotional responses, and behaviors. As a counselor, mastering these core CBT skills will give you practical tools for structuring sessions and guiding clients toward meaningful change.',
  cognitiveTriangle:
    'The Cognitive Triangle is the foundation of CBT. It illustrates how Thoughts, Feelings, and Behaviors are interconnected: changing one affects the others. A negative thought can trigger difficult emotions, which lead to unhelpful behaviors, which reinforce the negative thought.',
  whyLearnCBT: [
    'CBT is one of the most researched and effective therapeutic approaches',
    'It provides structured, practical tools you can use immediately',
    'Clients often respond well to its collaborative, skill-building nature',
    'CBT skills apply across many mental health concerns',
    'It empowers clients with self-help strategies they can use between sessions',
  ],
};

export const CBT_TOPICS: CBTTopic[] = [
  {
    id: 'identifying-problems',
    title: 'Identifying Problems',
    shortDescription:
      'Learn to help clients articulate their core issues through open-ended questions and reflective listening.',
    overview:
      'The first step in CBT is helping clients clearly identify what they are struggling with. Many clients arrive with vague distress or multiple overlapping concerns. Your role is to help them move from "everything feels wrong" to a clear, specific problem list that you can work on together.',
    cognitiveTriangleConnection:
      'When identifying problems, you are mapping out which thoughts, feelings, and behaviors are most distressing. A client may say "I feel terrible" — your job is to unpack whether the primary driver is a thought pattern ("I always fail"), an emotional state (persistent sadness), or a behavioral pattern (avoiding classes).',
    keyPrinciples: [
      'Use open-ended questions to explore, not closed yes/no questions',
      'Reflect back what you hear to show understanding and check accuracy',
      'Help the client prioritize — you cannot tackle everything at once',
      'Look for the specific situations where problems show up most',
      'Distinguish between the presenting problem and underlying core issues',
      'Validate the client\'s experience before moving to problem-solving',
    ],
    steps: [
      'Start with broad, open-ended exploration: "What brings you in today?" or "Tell me about what\'s been going on."',
      'Use reflective listening to demonstrate understanding: "It sounds like you\'ve been feeling overwhelmed by..."',
      'Ask clarifying questions to get specifics: "Can you give me a recent example of when that happened?"',
      'Identify patterns by asking about frequency, triggers, and context',
      'Collaboratively create a problem list and agree on priorities',
      'Summarize the identified problems back to the client for confirmation',
    ],
    examples: [
      {
        concern: 'Anxiety',
        scenario:
          'A student says "I just can\'t handle school anymore, everything makes me anxious."',
        counselorExample:
          '"It sounds like anxiety is really impacting your school experience. Can you walk me through what a typical anxious day looks like for you? What\'s the first thing that triggers that anxious feeling?"',
        explanation:
          'This validates the student\'s experience, then narrows from a vague complaint to specific triggers and patterns.',
      },
      {
        concern: 'Depression',
        scenario:
          'A student says "I don\'t know what\'s wrong with me. I just feel empty."',
        counselorExample:
          '"Thank you for sharing that with me. When you say you feel empty, can you tell me more about what that\'s like? When did you first start noticing this feeling?"',
        explanation:
          'This normalizes disclosure, explores the subjective experience, and starts establishing a timeline.',
      },
      {
        concern: 'Family Conflict',
        scenario:
          'A student says "My parents are driving me crazy. We fight about everything."',
        counselorExample:
          '"It sounds like things at home are really tense right now. What are the main things you and your parents tend to disagree about? Can you tell me about the last argument you had?"',
        explanation:
          'This reflects the emotion, then asks for specifics to identify the core areas of conflict.',
      },
      {
        concern: 'Academic Stress',
        scenario:
          'A student says "I\'m failing and I don\'t know how to fix it."',
        counselorExample:
          '"That sounds really stressful. When you say you\'re failing, can you tell me more about what\'s happening with your coursework? Is it certain classes, or does it feel like everything is slipping?"',
        explanation:
          'This acknowledges distress and seeks to distinguish between global catastrophizing and specific academic difficulties.',
      },
    ],
    exercises: [
      {
        scenario:
          'A 20-year-old student comes in and says: "I just feel stuck. I\'m not doing well in school, my friends are all moving forward, and I can\'t seem to get motivated to do anything. I don\'t even know why I\'m here really."',
        instructions:
          'Write your opening response to this student. Focus on validating their experience and asking an open-ended question that helps identify the most pressing specific problem.',
        hints: [
          'Acknowledge the courage it took to come in',
          'Reflect back the "stuck" feeling',
          'Pick one thread to explore further with an open-ended question',
          'Avoid trying to solve anything yet — just explore',
        ],
        skillFocus: 'Open-ended questioning and reflective listening for problem identification',
      },
      {
        scenario:
          'A 22-year-old student says: "I keep getting into arguments with my roommate. And my grades are slipping. And I haven\'t been sleeping. I don\'t know, everything is just falling apart."',
        instructions:
          'The student has listed multiple problems at once. Write a response that validates their overwhelm, then helps them prioritize which issue to focus on first.',
        hints: [
          'Acknowledge that having many problems at once is overwhelming',
          'Reflect back the key issues you heard',
          'Ask which one feels most urgent or is bothering them most',
          'Avoid trying to address all three at once',
        ],
        skillFocus: 'Problem prioritization and collaborative agenda-setting',
      },
      {
        scenario:
          'A 19-year-old student says: "My parents want me to be pre-med but I hate science. I feel guilty for wanting something different. I think something is wrong with me because I should be grateful."',
        instructions:
          'Write a response that helps uncover the core problem beneath the surface. Is the main issue the career conflict, the guilt, the family expectations, or something else? Use open-ended questions to explore.',
        hints: [
          'There are multiple layers here — don\'t jump to the obvious one',
          'Reflect back the tension between their wishes and their parents\' expectations',
          'Explore the guilt — where does the "should" come from?',
          'Ask what they would choose if guilt weren\'t a factor',
        ],
        skillFocus: 'Distinguishing presenting problems from underlying core issues',
      },
    ],
    simulatorContext: {
      suggestedConcern: 'academic-stress',
      objective:
        'Practice identifying the core problems by using open-ended questions and reflective listening. Aim to create a clear problem list with the patient.',
      tips: [
        'Start with broad questions, then narrow down',
        'Reflect back what you hear before asking the next question',
        'Try to identify at least 2-3 specific problems',
        'Summarize the problems before the end of the conversation',
      ],
    },
  },
  {
    id: 'setting-goals',
    title: 'Setting Goals',
    shortDescription:
      'Guide clients in creating SMART goals and breaking large problems into manageable steps.',
    overview:
      'Once problems are identified, CBT focuses on setting clear, achievable goals. Good goal-setting is collaborative — the counselor helps the client articulate what they want to change and breaks vague aspirations ("I want to feel better") into specific, measurable targets. This gives therapy direction and helps both counselor and client track progress.',
    cognitiveTriangleConnection:
      'Goals in CBT can target any point of the cognitive triangle. A thought-focused goal might be "Reduce self-critical thoughts from daily to twice a week." A feeling-focused goal might be "Feel less anxious in social situations." A behavior-focused goal might be "Attend all classes this week." Effective treatment often sets goals across all three.',
    keyPrinciples: [
      'Goals should be collaborative — the client\'s priorities come first',
      'Use the SMART framework: Specific, Measurable, Achievable, Relevant, Time-bound',
      'Break large goals into smaller, manageable sub-goals',
      'Connect goals back to the identified problems',
      'Include both short-term wins and long-term aspirations',
      'Goals should be framed positively (what to do, not just what to stop)',
    ],
    steps: [
      'Ask the client what they want to be different: "If our work together is successful, what would change?"',
      'Help translate vague goals into specific ones: "When you say you want to feel better, what would that look like day-to-day?"',
      'Apply SMART criteria to each goal collaboratively',
      'Prioritize goals — which one would make the biggest difference right now?',
      'Break the top-priority goal into 2-3 small first steps',
      'Write down the goals together so both parties have a shared reference',
    ],
    examples: [
      {
        concern: 'Anxiety',
        scenario:
          'Student says "I just want to stop being anxious all the time."',
        counselorExample:
          '"That makes sense — anxiety is exhausting. Let\'s make that more specific so we can track your progress. Where does anxiety interfere most? If we could reduce your anxiety in one area first, which would make the biggest difference?"',
        explanation:
          'This validates the wish, then guides toward a specific, targeted goal rather than an all-or-nothing aspiration.',
      },
      {
        concern: 'Depression',
        scenario:
          'Student says "I want to feel like myself again."',
        counselorExample:
          '"That\'s a really meaningful goal. Can you tell me what \'feeling like yourself\' looks like? What were you doing, thinking, or feeling when you felt most like you?"',
        explanation:
          'This explores the client\'s own definition of wellness and identifies concrete behavioral markers to aim for.',
      },
      {
        concern: 'Academic Stress',
        scenario:
          'Student says "I need to get my grades up or I\'ll lose my scholarship."',
        counselorExample:
          '"That\'s a clear and important goal. Let\'s break it down — which classes are you most worried about? What grade would you need to feel on track? What\'s one specific study habit we could work on this week?"',
        explanation:
          'This breaks an overwhelming goal into specific, actionable components with a clear first step.',
      },
    ],
    exercises: [
      {
        scenario:
          'A student says: "I just want to be happy. I\'m tired of feeling this way. I want to actually enjoy college instead of just surviving it."',
        instructions:
          'Write a response that helps this student turn their wish ("be happy") into 1-2 SMART goals. Guide them toward specifics without dismissing the broader desire.',
        hints: [
          'Validate the desire to feel happy — it\'s legitimate',
          'Ask what "enjoying college" would look like concretely',
          'Suggest framing a goal around a specific behavior or situation',
          'Aim for something achievable this week as a first step',
        ],
        skillFocus: 'SMART goal-setting and collaborative treatment planning',
      },
      {
        scenario:
          'A student says: "I need to stop having panic attacks. They happen before every exam and sometimes even in class. I just need them to go away completely."',
        instructions:
          'The student wants an all-or-nothing goal ("stop completely"). Write a response that validates the goal, then helps reframe it into something measurable and achievable as a first step.',
        hints: [
          'Validate that panic attacks are distressing and worth addressing',
          'Gently reframe "stop completely" into a more realistic first target',
          'Help them identify a measurable indicator of progress',
          'Suggest a concrete first step for this week',
        ],
        skillFocus: 'Reframing unrealistic goals into achievable first steps',
      },
      {
        scenario:
          'A student says: "I want to be more confident. I always second-guess myself and I\'m tired of it. I just want to believe in myself."',
        instructions:
          'Write a response that helps translate "be more confident" into specific, observable goals. Confidence is abstract — help the student identify what confident behavior would look like.',
        hints: [
          'Ask what confident behavior would look like in their daily life',
          'Identify specific situations where they want to feel more confident',
          'Frame a goal around a behavior, not a feeling',
          'Break it into something they can try this week',
        ],
        skillFocus: 'Translating abstract goals into specific behavioral targets',
      },
    ],
    simulatorContext: {
      suggestedConcern: 'depression',
      objective:
        'Practice helping the patient set specific, measurable goals. Move from vague desires to concrete, achievable targets.',
      tips: [
        'Ask what they want to be different',
        'Help them get specific — what, when, how much',
        'Suggest a small first step they could try this week',
        'Connect goals back to their stated concerns',
      ],
    },
  },
  {
    id: 'thought-records',
    title: 'Thought Records',
    shortDescription:
      'Teach clients to capture and examine their automatic thoughts using structured thought records.',
    overview:
      'Thought records are one of the most powerful CBT tools. They help clients slow down and examine the automatic thoughts that drive their emotional reactions. The standard 5-column thought record captures: Situation, Automatic Thought, Emotion, Evidence For/Against, and Balanced Thought. Teaching clients to use thought records gives them a lifelong self-help skill.',
    cognitiveTriangleConnection:
      'Thought records directly target the "Thoughts" corner of the cognitive triangle. By capturing the automatic thought triggered by a situation, clients can see how that thought drives their emotional and behavioral response. The goal is to make the invisible thinking process visible and examinable.',
    keyPrinciples: [
      'Automatic thoughts are the quick, reflexive thoughts that pop up in response to situations',
      'Most people are unaware of their automatic thoughts until trained to notice them',
      'Thought records make invisible mental processes visible and examinable',
      'Start with recent, concrete situations — not abstract worries',
      'Capture the "hot thought" — the one that carries the most emotional charge',
      'Emotions should be labeled and rated in intensity (0-100%)',
    ],
    steps: [
      'Explain the concept: "Our brains generate automatic thoughts all the time. Some are helpful, some aren\'t. Let\'s learn to catch them."',
      'Start with a recent, specific situation the client found upsetting',
      'Ask: "What was going through your mind right at that moment?" to capture the automatic thought',
      'Identify the emotion: "And when you had that thought, how did it make you feel? Rate it 0-100."',
      'Explore evidence: "What evidence supports this thought? What evidence goes against it?"',
      'Guide toward a balanced thought: "Based on all the evidence, is there a more balanced way to see this?"',
    ],
    examples: [
      {
        concern: 'Anxiety',
        scenario:
          'Student got a B on an exam and felt panicked.',
        counselorExample:
          '"Let\'s walk through this together. The situation was getting a B on the exam. What was the very first thought that went through your mind when you saw that grade?" (Student: "I\'m going to fail this class.") "Okay, and when you had that thought, what emotion did you feel and how intense was it, 0 to 100?"',
        explanation:
          'This walks through the first three columns of a thought record in a natural, conversational way.',
      },
      {
        concern: 'Depression',
        scenario:
          'Student\'s friend didn\'t respond to a text for two days.',
        counselorExample:
          '"So the situation was that your friend didn\'t text back. What went through your mind?" (Student: "Nobody actually cares about me.") "That\'s a painful thought. Let\'s examine it — what evidence supports that thought? And what evidence goes against it?"',
        explanation:
          'This identifies the automatic thought and begins the evidence examination process.',
      },
      {
        concern: 'Academic Stress',
        scenario:
          'Student procrastinated on an assignment and felt overwhelmed.',
        counselorExample:
          '"Let\'s use a thought record here. When you sat down to start the assignment and felt that wave of overwhelm, what thought was going through your mind?" (Student: "I\'ll never get this done, I\'m too behind.") "And what emotion came with that? How intense?"',
        explanation:
          'This connects a specific moment to the automatic thought and emotional response.',
      },
    ],
    exercises: [
      {
        scenario:
          'A student tells you: "I was in the library studying and I saw a group of students from my class laughing together. I immediately felt terrible and left. I couldn\'t study after that."',
        instructions:
          'Walk the student through a thought record for this situation. Identify the automatic thought, the emotion, and begin the evidence examination. Write your response as you would say it to the student.',
        hints: [
          'Start by clarifying the situation',
          'Ask "What went through your mind?" to get the automatic thought',
          'Help label the emotion and rate its intensity',
          'Begin asking about evidence for and against the thought',
        ],
        skillFocus: 'Guiding a client through a 5-column thought record',
      },
      {
        scenario:
          'A student says: "I raised my hand in class and gave the wrong answer. The professor corrected me in front of everyone. I wanted to disappear. I haven\'t spoken up in class since then — that was three weeks ago."',
        instructions:
          'Help the student identify the automatic thought connected to this situation, label the emotion, and begin to examine whether the thought is accurate. Write your response as a natural conversation.',
        hints: [
          'The situation is clear — focus on "What went through your mind?"',
          'The emotion might be embarrassment or shame — help them name it',
          'Ask about the evidence: did people actually react badly?',
          'Explore whether avoiding speaking up has helped or hurt',
        ],
        skillFocus: 'Identifying automatic thoughts and connecting them to behavioral consequences',
      },
      {
        scenario:
          'A student says: "I was supposed to meet my friend for coffee but she cancelled last minute. She said she was sick. I feel like no one wants to spend time with me. I didn\'t text anyone else, I just went home and stayed there all weekend."',
        instructions:
          'Guide the student through a full thought record: situation, automatic thought, emotion with intensity rating, evidence for and against, and a balanced thought. Do this conversationally, not like a worksheet.',
        hints: [
          'The automatic thought likely involves rejection or being unwanted',
          'Ask for the emotion and intensity rating',
          'Evidence against: the friend gave a reason (sick) — is there evidence she was lying?',
          'Guide toward a balanced thought that accounts for the friend\'s explanation',
        ],
        skillFocus: 'Completing a full 5-column thought record conversationally',
      },
    ],
    simulatorContext: {
      suggestedConcern: 'anxiety',
      objective:
        'Practice guiding the patient through a thought record. Help them identify automatic thoughts, label emotions, and start examining evidence.',
      tips: [
        'Ask about a specific recent upsetting situation',
        'Use "What was going through your mind?" to capture thoughts',
        'Help them rate the emotion intensity',
        'Guide them through evidence for and against',
      ],
    },
  },
  {
    id: 'challenging-thoughts',
    title: 'Challenging Thoughts',
    shortDescription:
      'Help clients identify cognitive distortions and develop balanced thinking through Socratic questioning.',
    overview:
      'Once clients can identify their automatic thoughts, the next step is learning to challenge unhelpful ones. This involves recognizing common cognitive distortions (thinking errors), using Socratic questioning to examine thoughts, and developing more balanced alternatives. The goal is not positive thinking — it is accurate, balanced thinking.',
    cognitiveTriangleConnection:
      'Challenging thoughts directly modifies the "Thoughts" corner of the cognitive triangle, which then ripples out to change feelings and behaviors. When a client shifts from "I always fail" to "I sometimes struggle, but I have also succeeded many times," their emotional response shifts from despair to cautious optimism, and their behavior shifts from avoidance to engagement.',
    keyPrinciples: [
      'The goal is balanced thinking, NOT positive thinking',
      'Common cognitive distortions include: all-or-nothing thinking, catastrophizing, mind-reading, fortune-telling, personalization, and overgeneralization',
      'Socratic questioning helps clients discover alternatives themselves rather than being told',
      'Challenge the thought, never the person',
      'A balanced thought acknowledges difficulty while also recognizing nuance',
      'Repetition is key — challenging thoughts is a skill that improves with practice',
    ],
    steps: [
      'Identify the hot automatic thought from the thought record',
      'Name the cognitive distortion if one is present: "This sounds like it might be all-or-nothing thinking. What do you think?"',
      'Use Socratic questions: "What would you say to a friend who had this thought?" or "What\'s the worst that could realistically happen?"',
      'Examine the evidence: "Is there any evidence that this thought isn\'t 100% true?"',
      'Develop a balanced alternative: "Based on everything we\'ve discussed, what\'s a more balanced way to think about this?"',
      'Rate how the new thought changes the emotion intensity',
    ],
    examples: [
      {
        concern: 'Anxiety (Catastrophizing)',
        scenario:
          'Student\'s automatic thought: "If I fail this test, my life is over."',
        counselorExample:
          '"That\'s a really intense thought. Let\'s look at it together. This sounds like it might be catastrophizing — jumping to the worst possible outcome. What do you think? Have you ever done poorly on a test before? What actually happened?"',
        explanation:
          'This names the distortion gently, then uses evidence-based questioning to challenge the catastrophe.',
      },
      {
        concern: 'Depression (All-or-Nothing)',
        scenario:
          'Student\'s automatic thought: "I\'m a complete failure."',
        counselorExample:
          '"I hear how painful that belief is. When you say \'complete failure,\' that\'s all-or-nothing thinking — either total success or total failure with nothing in between. Can you think of anything, even something small, that you\'ve succeeded at recently?"',
        explanation:
          'This validates the pain, names the distortion, and uses Socratic questioning to introduce nuance.',
      },
      {
        concern: 'Relationship Issues (Mind-Reading)',
        scenario:
          'Student\'s automatic thought: "Everyone thinks I\'m weird."',
        counselorExample:
          '"That must be a lonely feeling. When you say everyone thinks you\'re weird, that sounds like mind-reading — assuming we know what others think. Do you have actual evidence that specific people think this? Have you ever been wrong about what someone was thinking?"',
        explanation:
          'This names the mind-reading distortion and invites the client to test the assumption against evidence.',
      },
    ],
    exercises: [
      {
        scenario:
          'A student tells you their automatic thought is: "I got a C on my paper, which proves I\'m stupid and don\'t belong in college." They feel ashamed (85/100) and have been skipping that class.',
        instructions:
          'Write a response that helps this student challenge this thought. Identify the cognitive distortion(s), use Socratic questioning, and guide them toward a more balanced thought.',
        hints: [
          'Identify the distortions (overgeneralization, labeling)',
          'Ask Socratic questions — don\'t just tell them they\'re wrong',
          'Help them see the difference between one grade and their overall ability',
          'Guide toward a balanced thought that acknowledges the disappointment without the global label',
        ],
        skillFocus: 'Identifying cognitive distortions and Socratic questioning',
      },
      {
        scenario:
          'A student says: "My friend got an internship and I didn\'t. I\'ll never be successful. Everyone is ahead of me and I\'m falling behind. There\'s no point in even trying anymore."',
        instructions:
          'This student is using multiple cognitive distortions. Identify them, use Socratic questioning to challenge the thoughts, and help them develop a balanced perspective.',
        hints: [
          'Spot the distortions: fortune-telling ("I\'ll never"), overgeneralization ("everyone"), all-or-nothing ("no point")',
          'Ask about their own accomplishments — are they really "behind"?',
          'Use the "friend test" — what would they say to a friend in this situation?',
          'Help them see that one rejection does not define their future',
        ],
        skillFocus: 'Challenging multiple cognitive distortions simultaneously',
      },
      {
        scenario:
          'A student says: "I know my roommate is mad at me. She didn\'t say good morning today. She probably hates living with me. I should just request a room transfer before she does."',
        instructions:
          'The student is mind-reading and jumping to conclusions. Write a response that helps them recognize this pattern and consider alternative explanations.',
        hints: [
          'Name the mind-reading distortion gently',
          'Ask if there could be other reasons the roommate didn\'t say good morning',
          'Explore whether they have actual evidence of anger',
          'Help them think of a way to check the assumption instead of acting on it',
        ],
        skillFocus: 'Challenging mind-reading and jumping to conclusions',
      },
    ],
    simulatorContext: {
      suggestedConcern: 'depression',
      objective:
        'Practice identifying cognitive distortions in the patient\'s thinking and using Socratic questioning to help them develop balanced alternatives.',
      tips: [
        'Listen for all-or-nothing language ("always", "never", "everyone")',
        'Name distortions gently — "This sounds like it might be..."',
        'Use questions, not lectures, to challenge thoughts',
        'Help them arrive at a balanced thought, not a positive one',
      ],
    },
  },
  {
    id: 'behavioral-activation',
    title: 'Behavioral Activation',
    shortDescription:
      'Use activity scheduling and graded tasks to help clients re-engage with life and break cycles of avoidance.',
    overview:
      'Behavioral activation is based on the idea that behavior change can drive thought and mood change. When clients are depressed or anxious, they often withdraw from activities, which worsens their mood, leading to more withdrawal. Behavioral activation breaks this cycle by scheduling meaningful activities, using graded tasks to reduce overwhelm, and tracking pleasure and mastery experiences.',
    cognitiveTriangleConnection:
      'Behavioral activation targets the "Behaviors" corner of the cognitive triangle. By changing what clients DO, we influence how they think and feel. A client who starts attending one class again may think "Maybe I can handle this" and feel a spark of hope — demonstrating how behavior change ripples through the triangle.',
    keyPrinciples: [
      'Action often comes before motivation, not after',
      'Start small — graded tasks build confidence gradually',
      'Track both pleasure (enjoyment) and mastery (accomplishment) in activities',
      'Schedule activities in advance rather than waiting to "feel like it"',
      'Connect activities back to the client\'s values and goals',
      'Anticipate and problem-solve barriers before they happen',
    ],
    steps: [
      'Explain the withdrawal cycle: "When we stop doing things, we feel worse, which makes us want to do even less."',
      'Conduct an activity audit: "Walk me through your typical day right now."',
      'Identify activities that used to bring pleasure or a sense of accomplishment',
      'Create a graded task hierarchy: start with the easiest, least threatening activity',
      'Schedule specific activities for specific times: "On Tuesday at 2pm, you\'ll go for a 10-minute walk."',
      'Review results next session: "How did it go? Rate the pleasure (0-10) and mastery (0-10)."',
    ],
    examples: [
      {
        concern: 'Depression',
        scenario:
          'Student has stopped going to classes and mostly stays in their dorm room.',
        counselorExample:
          '"It sounds like the less you do, the worse you feel, and the worse you feel, the less you do. That\'s a really common cycle. What if we started really small — not going to all your classes, but just one thing this week? What would feel manageable?"',
        explanation:
          'This names the withdrawal cycle, normalizes it, and starts with a graded approach.',
      },
      {
        concern: 'Anxiety',
        scenario:
          'Student avoids the dining hall due to social anxiety and eats alone in their room.',
        counselorExample:
          '"Avoiding the dining hall makes sense when you\'re anxious — it removes the discomfort. But it also keeps your world small. What if we built a ladder? Step one might be eating in the dining hall at a quiet time. What time is it least crowded?"',
        explanation:
          'This validates the avoidance, explains the cost, and introduces graded exposure.',
      },
      {
        concern: 'Academic Stress',
        scenario:
          'Student is overwhelmed by assignments and has stopped working on them entirely.',
        counselorExample:
          '"When everything feels overwhelming, it\'s natural to shut down. But let\'s break this down. What\'s one assignment that\'s due soonest? What would it look like to work on just that one for 15 minutes today — not finish it, just start?"',
        explanation:
          'This normalizes the shutdown, then introduces a micro-task approach to break through avoidance.',
      },
    ],
    exercises: [
      {
        scenario:
          'A student tells you: "I used to love going to the gym and hanging out with friends, but I haven\'t done either in weeks. I just stay in bed and watch videos. I know I should do stuff but I have zero motivation."',
        instructions:
          'Write a response that introduces behavioral activation. Help the student plan one small, specific activity for this week. Address the "waiting for motivation" trap.',
        hints: [
          'Explain that action often comes before motivation',
          'Help them pick ONE specific activity to schedule',
          'Make it small and concrete — day, time, duration',
          'Anticipate a barrier and problem-solve it together',
        ],
        skillFocus: 'Behavioral activation, activity scheduling, and graded tasks',
      },
      {
        scenario:
          'A student says: "I tried going to the campus event like we talked about, but when I got to the door I turned around and went home. I just couldn\'t do it. I feel like a failure."',
        instructions:
          'The student attempted an activity but couldn\'t complete it. Write a response that reframes this as partial success, adjusts the task difficulty, and plans a graded approach.',
        hints: [
          'Acknowledge that getting to the door WAS progress — don\'t dismiss it',
          'Normalize that the step may have been too big',
          'Create a graded hierarchy: what would be a smaller step?',
          'Help them plan a less threatening version of the same activity',
        ],
        skillFocus: 'Graded task adjustment and reframing setbacks as data',
      },
      {
        scenario:
          'A student says: "I went for the walk we planned and honestly I didn\'t feel any better. It was cold and I just wanted to go back inside. I don\'t think this activity stuff works for me."',
        instructions:
          'The student completed the activity but didn\'t feel immediate results. Write a response that validates their effort, explains why one activity isn\'t enough, and helps them choose an activity with more personal meaning.',
        hints: [
          'Celebrate that they followed through — that takes effort',
          'Explain that behavioral activation is cumulative, not instant',
          'Ask about pleasure vs. mastery — was there any sense of accomplishment?',
          'Help them pick an activity that connects to their values or used to bring joy',
        ],
        skillFocus: 'Managing expectations and connecting activities to values',
      },
    ],
    simulatorContext: {
      suggestedConcern: 'depression',
      objective:
        'Practice using behavioral activation to help the patient re-engage with meaningful activities. Focus on scheduling specific, small activities.',
      tips: [
        'Ask about their typical day to identify withdrawal patterns',
        'Ask what they used to enjoy doing',
        'Suggest starting very small — don\'t overwhelm them',
        'Help them schedule a specific activity for a specific time',
      ],
    },
  },
  {
    id: 'wrapping-up',
    title: 'Wrapping Up Sessions',
    shortDescription:
      'Learn to end sessions effectively with summaries, homework assignments, and follow-up planning.',
    overview:
      'How you end a CBT session is as important as how you begin it. A good wrap-up consolidates learning, assigns homework that extends the session\'s impact, checks in on the client\'s emotional state, and sets expectations for next time. Rushed or absent endings can undo good work done during the session.',
    cognitiveTriangleConnection:
      'Wrapping up connects all three corners of the cognitive triangle. You summarize what the client learned about their thoughts, how they felt during the session (feelings), and what they plan to do before next session (behaviors). The homework assignment specifically targets one corner of the triangle for the client to work on independently.',
    keyPrinciples: [
      'Reserve the last 5-10 minutes for wrap-up — don\'t rush it',
      'Summarize the key takeaway collaboratively, not just for the client',
      'Homework should be specific, achievable, and directly connected to the session',
      'Check in: "How are you feeling right now?" before they leave',
      'Preview next session: "Next time, we\'ll build on what we did today by..."',
      'Address any unfinished emotional business — don\'t let them leave distressed',
    ],
    steps: [
      'Signal the transition: "We have about 10 minutes left, so let\'s start wrapping up."',
      'Collaborative summary: "What stood out to you most from today\'s session?"',
      'Add your own observations: "I also noticed that when we talked about X, you seemed to have an insight about Y."',
      'Assign homework collaboratively: "Based on what we covered, what would be useful to practice this week?"',
      'Confirm the homework is specific and written down',
      'Check emotional state: "How are you feeling right now, compared to when we started?"',
      'Preview next session and confirm the next appointment',
    ],
    examples: [
      {
        concern: 'Anxiety',
        scenario:
          'You spent the session teaching thought records for anxiety.',
        counselorExample:
          '"We\'re coming up on time. Today we worked on catching your anxious thoughts using a thought record. What felt most useful to you? For homework, I\'d like you to try filling out one thought record this week when you notice anxiety. Just one — no pressure to do it perfectly. How does that sound?"',
        explanation:
          'This summarizes, asks for the client\'s perspective, assigns manageable homework, and reduces performance pressure.',
      },
      {
        concern: 'Depression',
        scenario:
          'You spent the session on behavioral activation planning.',
        counselorExample:
          '"Let\'s wrap up. Today we talked about how the withdrawal cycle works and planned some small activities. You\'re going to try going for a 10-minute walk on Wednesday and having lunch with Sarah on Friday. Does that still feel doable? Rate your mood right now compared to the start."',
        explanation:
          'This reviews the plan, confirms commitment, checks feasibility, and monitors emotional state.',
      },
      {
        concern: 'Family Conflict',
        scenario:
          'You spent the session exploring family dynamics and communication patterns.',
        counselorExample:
          '"We covered a lot of ground today about your family communication patterns. What was the biggest takeaway for you? For this week, would you be willing to try the \'I feel\' statement we practiced when you talk to your mom about curfew? Let\'s write down exactly what you\'ll say."',
        explanation:
          'This invites reflection, assigns a specific behavioral experiment, and rehearses it.',
      },
    ],
    exercises: [
      {
        scenario:
          'You\'ve spent a session with a student who came in feeling overwhelmed about academic stress. During the session, you identified that their core automatic thought is "I have to be perfect or I\'m worthless," you challenged it together, and they developed the balanced thought "I can do my best without being perfect." There are 10 minutes left.',
        instructions:
          'Write your wrap-up for this session. Include a collaborative summary, a specific homework assignment, an emotional check-in, and a preview of next session.',
        hints: [
          'Ask them what stood out most first',
          'Summarize the key insight (the balanced thought)',
          'Assign homework related to the balanced thought',
          'Check how they are feeling right now',
          'Preview what you\'ll work on next time',
        ],
        skillFocus: 'Session summaries, homework assignment, and follow-up planning',
      },
      {
        scenario:
          'You\'ve spent a session helping a student with social anxiety. You worked on a thought record for a situation where they avoided a group project meeting. The student identified the thought "They\'ll judge me if I say something stupid" and developed the balanced thought "Most people are focused on their own contributions, not judging mine." You also planned a behavioral experiment: attending the next group meeting and speaking up once. There are 10 minutes left.',
        instructions:
          'Write a wrap-up that summarizes the session, confirms the behavioral experiment as homework, anticipates potential barriers, and checks how the student is feeling about the plan.',
        hints: [
          'Summarize both the thought record insight and the planned experiment',
          'Make sure the homework (attending the meeting) is specific: when, where',
          'Ask about potential barriers: "What might make this hard?"',
          'Check their anxiety level about the homework — don\'t let them leave overwhelmed',
        ],
        skillFocus: 'Assigning behavioral experiments as homework and barrier planning',
      },
      {
        scenario:
          'You\'ve spent a first session with a student who has depression and family conflict. You explored their situation and identified three main problems: low motivation, arguments with their mother about career choices, and isolation from friends. You prioritized working on isolation first since it connects to both mood and social support. There are 10 minutes left in this first session.',
        instructions:
          'Write a first-session wrap-up. Summarize what you learned, confirm the treatment priorities, assign a small first-week homework, check how they feel about the plan, and preview next session\'s focus.',
        hints: [
          'First sessions need extra care in the wrap-up — set expectations for treatment',
          'Confirm the problem list and the agreed priority',
          'Assign something very small — this is their first homework ever',
          'Ask how they feel about coming back — normalize any ambivalence',
          'Preview what the next session will focus on',
        ],
        skillFocus: 'First-session wrap-up, treatment planning, and engagement',
      },
    ],
    simulatorContext: {
      suggestedConcern: 'academic-stress',
      objective:
        'Practice ending a session well. After discussing the patient\'s concerns, practice summarizing, assigning homework, checking emotional state, and planning follow-up.',
      tips: [
        'After a few exchanges, signal that the session is ending',
        'Ask the patient what stood out to them',
        'Suggest a specific, small homework assignment',
        'Check how they are feeling before ending',
      ],
    },
  },
];
