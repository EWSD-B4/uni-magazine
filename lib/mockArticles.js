const MOCK_ARTICLES = [
  {
    id: "arts-after-hours",
    ownerId: "guest-001",
    title: "Arts After Hours Reimagines the Student Studio",
    faculty: "Arts & Humanities",
    section: "Campus Culture",
    author: "Nora Ellison",
    excerpt:
      "Late-night studio access has reshaped how student artists build critique circles and finish exhibition-ready work.",
    publishedAt: "2026-02-28",
    readTime: "6 min read",
    images: [
      {
        src: "/article-images/campus-dawn.svg",
        alt: "A campus skyline at dawn",
      },
      {
        src: "/article-images/studio-wall.svg",
        alt: "An abstract studio wall composition",
      },
    ],
    body: [
      "The reopened studio schedule has changed more than building hours. Students now treat the space as a working commons where drafts, sketches, and informal critiques move faster than formal class review cycles.",
      "Faculty advisers say the strongest projects this term are more iterative because students can return to the studio when ideas are fresh, rather than waiting for the next scheduled session.",
      "What began as a facilities adjustment is now shaping editorial interest as well. Magazine contributors are documenting how creative practice spills into community, collaboration, and student identity.",
    ],
  },
  {
    id: "market-lab-local-shops",
    ownerId: "coordinator-001",
    title: "Student Market Lab Helps Local Shops Rethink Foot Traffic",
    faculty: "Business & Economics",
    section: "Enterprise",
    author: "Aria Patel",
    excerpt:
      "A faculty-backed marketing sprint paired students with neighborhood stores to test low-cost storefront campaigns.",
    publishedAt: "2026-02-24",
    readTime: "5 min read",
    images: [
      {
        src: "/article-images/community-voices.svg",
        alt: "Colorful storefront inspired graphics",
      },
      {
        src: "/article-images/editorial-desk.svg",
        alt: "A desk with notes and planning documents",
      },
    ],
    body: [
      "The project focused on practical experiments rather than abstract case studies. Students interviewed store owners, watched customer movement patterns, and proposed sharper window messaging.",
      "Several shops reported that simple changes in sign hierarchy and entry visibility produced an immediate improvement in walk-in interest over the following week.",
      "For the magazine team, the story offers a strong example of applied faculty work that feels grounded in the city around campus.",
    ],
  },
  {
    id: "prototype-night-finds-audience",
    ownerId: "student-001",
    title: "Prototype Night Finds an Audience Beyond Engineering",
    faculty: "Engineering & Design",
    section: "Innovation",
    author: "Leo Mercer",
    excerpt:
      "Open prototype reviews attracted design, business, and media students who wanted to translate complex ideas for wider audiences.",
    publishedAt: "2026-02-21",
    readTime: "7 min read",
    images: [
      {
        src: "/article-images/lab-notes.svg",
        alt: "A technical blueprint style composition",
      },
      {
        src: "/article-images/publication-stack.svg",
        alt: "Layered magazine spreads and layouts",
      },
    ],
    body: [
      "The evening was built for engineers, but the crowd quickly became interdisciplinary. Students from other faculties arrived with questions about storytelling, usability, and public explanation.",
      "That shift matters for the magazine. Technical achievements become more compelling when contributors can show how they change language, visibility, and collaboration across departments.",
      "Editors are now considering a recurring feature format that pairs prototypes with plain-language reporting and faculty reflection.",
    ],
  },
  {
    id: "clinic-simulation-reflection",
    ownerId: "health-student-mock",
    title: "Clinical Simulations Are Changing How Students Reflect",
    faculty: "Health & Life Sciences",
    section: "Learning",
    author: "Maya Cheung",
    excerpt:
      "Structured debrief sessions after simulation labs are giving student writers richer material for reflective reporting.",
    publishedAt: "2026-02-18",
    readTime: "6 min read",
    images: [
      {
        src: "/article-images/campus-dawn.svg",
        alt: "Soft light across a campus building",
      },
      {
        src: "/article-images/lab-notes.svg",
        alt: "Abstract notes representing clinical observation",
      },
    ],
    body: [
      "Simulation sessions are no longer treated as isolated exercises. Debriefs now emphasize reflection, communication, and the emotional pacing of professional judgment.",
      "Students writing about the experience are producing clearer, more detailed stories because the program gives them language for uncertainty, revision, and care.",
      "That reflective angle makes the subject more accessible to a general campus readership without flattening the complexity of the work.",
    ],
  },
  {
    id: "policy-forum-student-briefs",
    ownerId: "law-student-mock",
    title: "Policy Forum Turns Student Briefs Into Public-Facing Writing",
    faculty: "Law & Governance",
    section: "Public Affairs",
    author: "Daniel Rowe",
    excerpt:
      "Legal writing workshops are helping contributors turn technical policy analysis into magazine-ready features.",
    publishedAt: "2026-02-12",
    readTime: "5 min read",
    images: [
      {
        src: "/article-images/editorial-desk.svg",
        alt: "A desk scene with marked-up policy drafts",
      },
      {
        src: "/article-images/community-voices.svg",
        alt: "A civic discussion inspired illustration",
      },
    ],
    body: [
      "The forum asks students to work through a hard editorial problem: how to remain precise while also being readable for people outside the discipline.",
      "Contributors are learning to structure analysis around consequences, not only citations. That change gives magazine readers a clearer sense of what is at stake.",
      "Editors see the workshop as a model for translating specialist expertise into language that still feels rigorous and accountable.",
    ],
  },
  {
    id: "satellite-team-open-data",
    ownerId: "science-student-mock",
    title: "Open Data Gives the Satellite Team a Wider Story",
    faculty: "Science & Technology",
    section: "Research",
    author: "Imani Brooks",
    excerpt:
      "A student satellite project is sharing data publicly, creating new opportunities for reporting, visualization, and campus collaboration.",
    publishedAt: "2026-02-09",
    readTime: "7 min read",
    images: [
      {
        src: "/article-images/publication-stack.svg",
        alt: "Printed spreads with data-inspired patterns",
      },
      {
        src: "/article-images/lab-notes.svg",
        alt: "A technical data illustration",
      },
    ],
    body: [
      "The data release changes how the project can be covered. Writers are no longer limited to press-style summaries and can instead explore visualizations, process notes, and cross-faculty uses.",
      "Faculty mentors say openness has also improved student confidence. Teams have a clearer sense that their work can circulate beyond the lab and invite interpretation.",
      "For the magazine, the project offers an ideal bridge between research culture and public storytelling.",
    ],
  },
  {
    id: "design-journal-pop-up",
    ownerId: "student-001",
    title: "A Pop-Up Design Journal Makes Critique Visible",
    faculty: "Engineering & Design",
    section: "Design Process",
    author: "Hana Lopez",
    excerpt:
      "Students transformed hallway display space into a serialized journal of sketches, revisions, and final prototypes.",
    publishedAt: "2026-02-05",
    readTime: "4 min read",
    images: [
      {
        src: "/article-images/studio-wall.svg",
        alt: "A wall of sketches and notes",
      },
      {
        src: "/article-images/campus-dawn.svg",
        alt: "Morning light over a creative building",
      },
    ],
    body: [
      "Instead of showing only polished outcomes, the installation foregrounded indecision, revisions, and alternate paths. That choice made the work more legible to visitors from outside the faculty.",
      "Magazine contributors covering the pop-up found that the most interesting quotes came from students describing what they removed rather than what they kept.",
      "The result is a story about process, not only product, and it fits the publication's editorial direction well.",
    ],
  },
  {
    id: "business-storytelling-clinic",
    ownerId: "business-student-mock",
    title: "Storytelling Clinics Help Analysts Write for Real Readers",
    faculty: "Business & Economics",
    section: "Communication",
    author: "Evelyn Hart",
    excerpt:
      "A new clinic pairs market analysis students with editors to sharpen argument, pacing, and narrative structure.",
    publishedAt: "2026-01-30",
    readTime: "5 min read",
    images: [
      {
        src: "/article-images/editorial-desk.svg",
        alt: "Editorial notes layered over charts",
      },
      {
        src: "/article-images/publication-stack.svg",
        alt: "Printed layouts stacked on a table",
      },
    ],
    body: [
      "The clinic treats business writing as communication work, not only technical output. Students are asked to identify the human stakes of the numbers they use.",
      "That approach has immediate editorial value because it produces drafts that already understand sequence, emphasis, and reader attention.",
      "Contributors leaving the workshop say they are more comfortable building magazine features without sacrificing analytical precision.",
    ],
  },
]

export function listArticles() {
  return [...MOCK_ARTICLES].sort((first, second) =>
    second.publishedAt.localeCompare(first.publishedAt)
  )
}

export function getArticleById(articleId) {
  return MOCK_ARTICLES.find((article) => article.id === articleId) || null
}
