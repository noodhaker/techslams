
export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  reputation: number;
  role: 'user' | 'moderator' | 'admin';
  joinDate: string;
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  count: number;
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  authorId: string;
  author: User;
  createdAt: string;
  updatedAt?: string;
  votes: number;
  isBestAnswer: boolean;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: User;
  createdAt: string;
  updatedAt?: string;
  tags: Tag[];
  views: number;
  votes: number;
  answerCount: number;
  answers: Answer[];
  hasBestAnswer: boolean;
}

// Mock Users
export const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    username: 'johndoe',
    avatar: 'https://i.pravatar.cc/150?img=1',
    reputation: 1250,
    role: 'admin',
    joinDate: '2023-01-15'
  },
  {
    id: '2',
    name: 'Jane Smith',
    username: 'janesmith',
    avatar: 'https://i.pravatar.cc/150?img=5',
    reputation: 830,
    role: 'moderator',
    joinDate: '2023-02-22'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    username: 'bobjohnson',
    avatar: 'https://i.pravatar.cc/150?img=8',
    reputation: 425,
    role: 'user',
    joinDate: '2023-03-10'
  },
  {
    id: '4',
    name: 'Alice Williams',
    username: 'alicew',
    avatar: 'https://i.pravatar.cc/150?img=9',
    reputation: 620,
    role: 'user',
    joinDate: '2023-04-05'
  }
];

// Mock Tags
export const tags: Tag[] = [
  { id: '1', name: 'javascript', description: 'For questions about JavaScript programming language', count: 120 },
  { id: '2', name: 'react', description: 'Questions about React library', count: 85 },
  { id: '3', name: 'node.js', description: 'For Node.js questions', count: 64 },
  { id: '4', name: 'css', description: 'Questions about CSS', count: 75 },
  { id: '5', name: 'html', description: 'HTML related questions', count: 92 },
  { id: '6', name: 'typescript', description: 'TypeScript language questions', count: 45 },
  { id: '7', name: 'python', description: 'Questions about Python programming', count: 110 },
  { id: '8', name: 'java', description: 'Java programming language questions', count: 70 }
];

// Mock Answers
const mockAnswers: Answer[] = [
  {
    id: '101',
    questionId: '1',
    content: 'To fix this issue, you need to add the correct event listener to the document. Try using `document.addEventListener("DOMContentLoaded", function() { ... })` to ensure your code runs after the DOM is fully loaded.',
    authorId: '2',
    author: users[1],
    createdAt: '2024-04-02T14:22:00Z',
    votes: 12,
    isBestAnswer: true
  },
  {
    id: '102',
    questionId: '1',
    content: 'Check if your JavaScript file is loaded correctly. Make sure it\'s included at the bottom of your HTML file or has the defer attribute. Also, check the browser console for any errors.',
    authorId: '3',
    author: users[2],
    createdAt: '2024-04-02T15:45:00Z',
    votes: 8,
    isBestAnswer: false
  },
  {
    id: '103',
    questionId: '2',
    content: 'You can use the flex property in CSS. Set `display: flex` on the parent element, then use `justify-content: center` to horizontally center and `align-items: center` to vertically center the content.',
    authorId: '4',
    author: users[3],
    createdAt: '2024-04-01T10:15:00Z',
    votes: 15,
    isBestAnswer: true
  },
  {
    id: '104',
    questionId: '3',
    content: 'To declare TypeScript interfaces for React props, you can use this pattern:\n\n```typescript\ninterface ButtonProps {\n  text: string;\n  onClick: () => void;\n  disabled?: boolean;\n}\n\nconst Button: React.FC<ButtonProps> = ({ text, onClick, disabled }) => {\n  return <button onClick={onClick} disabled={disabled}>{text}</button>;\n};\n```\n\nThe question mark after `disabled` makes it optional.',
    authorId: '1',
    author: users[0],
    createdAt: '2024-04-03T09:30:00Z',
    votes: 10,
    isBestAnswer: false
  }
];

// Mock Questions
export const questions: Question[] = [
  {
    id: '1',
    title: 'Why is my JavaScript code not working when the page loads?',
    content: 'I have a simple script that should run when the page loads, but nothing happens. Here\'s my code:\n\n```javascript\nfunction init() {\n  document.getElementById("myButton").addEventListener("click", function() {\n    alert("Button clicked!");\n  });\n}\n\ninit();\n```\n\nAny ideas what might be wrong?',
    authorId: '1',
    author: users[0],
    createdAt: '2024-04-02T12:30:00Z',
    tags: [tags[0], tags[4]],
    views: 125,
    votes: 8,
    answerCount: 2,
    answers: [mockAnswers[0], mockAnswers[1]],
    hasBestAnswer: true
  },
  {
    id: '2',
    title: 'How to center a div vertically and horizontally with CSS?',
    content: 'I\'ve been trying to center a div both vertically and horizontally inside its parent container, but nothing seems to work. I\'ve tried using margin: auto but it only centers it horizontally. What\'s the most reliable way to do this in 2024?',
    authorId: '3',
    author: users[2],
    createdAt: '2024-04-01T09:45:00Z',
    tags: [tags[3], tags[4]],
    views: 230,
    votes: 12,
    answerCount: 1,
    answers: [mockAnswers[2]],
    hasBestAnswer: true
  },
  {
    id: '3',
    title: 'Best way to define TypeScript interfaces for React props?',
    content: 'I\'m new to TypeScript and I\'m trying to figure out the best way to define interfaces for my React components. Should I use interfaces or types? And what\'s the best practice for organizing them in a large project?',
    authorId: '2',
    author: users[1],
    createdAt: '2024-04-03T08:15:00Z',
    tags: [tags[1], tags[5]],
    views: 85,
    votes: 5,
    answerCount: 1,
    answers: [mockAnswers[3]],
    hasBestAnswer: false
  },
  {
    id: '4',
    title: 'How to handle authentication in a React application?',
    content: 'I\'m building a React application and need to implement user authentication. What\'s the best approach for this? Should I use JWT tokens, sessions, or something else? Also, how should I structure my components to handle authenticated vs. non-authenticated states?',
    authorId: '4',
    author: users[3],
    createdAt: '2024-04-04T11:20:00Z',
    tags: [tags[1], tags[0], tags[2]],
    views: 150,
    votes: 7,
    answerCount: 0,
    answers: [],
    hasBestAnswer: false
  },
  {
    id: '5',
    title: 'Understanding Python list comprehensions',
    content: 'I\'m struggling to understand list comprehensions in Python. Can someone explain with simple examples how they work and when to use them instead of regular for loops?',
    authorId: '1',
    author: users[0],
    createdAt: '2024-04-05T14:50:00Z',
    tags: [tags[6]],
    views: 95,
    votes: 4,
    answerCount: 0,
    answers: [],
    hasBestAnswer: false
  }
];
