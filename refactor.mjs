import fs from 'fs';

let content = fs.readFileSync('apps/web/app/admin/page.tsx', 'utf-8');

content = content.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';");

const API_BASE = 'http://localhost:3001/admin';

// Inject useEffect for each section
// Users
content = content.replace(
  "const [users, setUsers] = useState<User[]>(MOCK_USERS);",
  `const [users, setUsers] = useState<User[]>(MOCK_USERS);\n  useEffect(() => { fetch('${API_BASE}/users').then(res => res.json()).then(setUsers); }, []);`
);

// Instructors
content = content.replace(
  "const [instructors, setInstructors] = useState<InstructorPerformance[]>(MOCK_INSTRUCTOR_PERFORMANCE);",
  `const [instructors, setInstructors] = useState<InstructorPerformance[]>(MOCK_INSTRUCTOR_PERFORMANCE);\n  useEffect(() => { fetch('${API_BASE}/tutors/performance').then(res => res.json()).then(setInstructors); }, []);`
);

// Courses
content = content.replace(
  "const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);",
  `const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);\n  useEffect(() => { fetch('${API_BASE}/courses').then(res => res.json()).then(setCourses).catch(e => console.error(e)); }, []);`
);

// Agents
content = content.replace(
  "const [agents, setAgents] = useState<AgentConfig[]>(MOCK_AGENT_CONFIGS);",
  `const [agents, setAgents] = useState<AgentConfig[]>(MOCK_AGENT_CONFIGS);\n  useEffect(() => { fetch('${API_BASE}/agents').then(res => res.json()).then(setAgents); }, []);`
);

// Moderation Items
content = content.replace(
  "const [items, setItems] = useState<ModerationItem[]>(MOCK_MODERATION_ITEMS);",
  `const [items, setItems] = useState<ModerationItem[]>(MOCK_MODERATION_ITEMS);\n  useEffect(() => { fetch('${API_BASE}/moderation').then(res => res.json()).then(setItems); }, []);`
);

// Analytics
// Analytics is not a useState array in the grep, it might be statically rendered. Let's not touch analytics unless needed, or search for MOCK_ANALYTICS.
content = content.replace(
  "MOCK_ANALYTICS.activeCohorts",
  "MOCK_ANALYTICS.activeCohorts // NOTE: Analytics fetching needs to be wired if it's dynamic"
);

fs.writeFileSync('apps/web/app/admin/page.tsx', content, 'utf-8');
console.log("Refactoring complete");
