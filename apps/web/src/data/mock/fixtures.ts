import type {
  Activity,
  Circle,
  Comment,
  EventDetails,
  Feedback,
  Member,
  Post,
  Prefs,
  Rsvp,
} from "../types";
import { defaultPrefs } from "../../lib/prefs";
import { devEmail } from "../devAccounts";

export const CURRENT_MEMBER_ID = "aaron";

export interface Db {
  members: Member[];
  circles: Circle[];
  posts: Post[];
  comments: Comment[];
  rsvps: Rsvp[];
  prefs: Prefs[];
  activity: Activity[];
  feedback: Feedback[];
  currentMemberId: string | null;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Seed dates are relative to `now` so the demo never goes stale. */
function clock(now: Date) {
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const at = (days: number, hour = 12, minute = 0) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    d.setHours(hour, minute);
    return d;
  };
  return {
    iso: (days: number, hour?: number, minute?: number) => at(days, hour, minute).toISOString(),
    day: (days: number) => {
      const d = at(days);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    },
    /** Birthday on today's month/day, placeholder year. */
    birthdayToday: () => `1992-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`,
  };
}

type MemberSeed = [id: string, name: string, bio: string];

const NAMED: MemberSeed[] = [
  ["aaron", "Aaron Blum", "Former teacher, current coder. Poems, mountains, padel (addict), design systems and a good laugh with friends."],
  ["odette", "Odette Laurent", "Ceramicist and weekend baker."],
  ["maryam", "Maryam Haddad", "Potter, painter, forever sketching on the U8."],
  ["nathaly", "Náthaly Ríos", "Salsa on Fridays, spreadsheets the rest of the week."],
  ["cemre", "Cemre Nur", "Designer. Collects tiny notebooks."],
  ["martin", "Martin Weber", "Cyclist, tinkerer, owner of too many plants."],
  ["yetunde", "Yetunde Adeyemi", "Storyteller. Hosts Story Circle every month."],
  ["georgios", "Georgios Papadakis", "Illustrator. Started Creative Corner."],
  ["david", "David Okafor", "Curious generalist. Cooks for crowds."],
  ["vki", "Vki Schmidt", "Loves long walks and longer playlists."],
  ["kasey", "Kasey Morgan", "Builder. Startups by day, synths by night."],
  ["naveen", "Naveen Rao", "Reader. Always halfway through three books."],
  ["aleksandra", "Aleksandra Nowak", "Coffee enthusiast and travel planner."],
  ["bolu", "Bolu Ajibawo", "Community lead. Ask me anything."],
];

const FIRST_NAMES = [
  "Mateo", "Yuki", "Priya", "Lukas", "Sofia", "Omar", "Hannah", "Tomas", "Mei", "Noah",
  "Léa", "Diego", "Anya", "Kwame", "Ingrid", "Rafael", "Elif", "Jonas", "Carmen", "Sven",
  "Aisha", "Pablo", "Nora", "Hassan", "Greta", "Andrei", "Maya", "Theo", "Wei", "Camille",
  "Ines", "Felix", "Zara", "Emil", "Lina", "Oskar",
];

const LAST_NAMES = ["Fischer", "Costa", "Ito", "Meyer", "Rossi", "Khan", "Byrne", "Novak", "Lin", "Park"];

function member(id: string, name: string, bio: string, i: number, now: Date): Member {
  const c = clock(now);
  return {
    id,
    name,
    email: devEmail(id),
    photoUrl: `https://i.pravatar.cc/400?u=${id}`,
    bio,
    phone: `+49 151 ${pad(10 + (i % 90))}${pad(20 + (i % 70))} ${pad(30 + (i % 60))}${pad(i % 100)}`,
    whatsappUrl: "https://wa.me/000",
    social: `https://instagram.com/${id.replace(/-/g, "")}`,
    birthday: id === "cemre" ? c.birthdayToday() : `19${80 + (i % 20)}-${pad(1 + (i % 12))}-${pad(1 + ((i * 7) % 28))}`,
    role: id === "aaron" || id === "bolu" ? "admin" : "member",
    joinedAt: c.iso(-280 + i * 5),
    birthdayPost: true,
  };
}

function buildMembers(now: Date): Member[] {
  const named = NAMED.map(([id, name, bio], i) => member(id, name, bio, i, now));
  const rest = FIRST_NAMES.map((first, i) => {
    const id = first.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return member(id, `${first} ${LAST_NAMES[i % LAST_NAMES.length]}`, `${first} is part of the Analog Circle.`, i + NAMED.length, now);
  });
  return [...named, ...rest];
}

const INNER_DESCRIPTION = "Seven members, one dinner a month, hosted in turn.";

function buildCircles(members: Member[], now: Date): Circle[] {
  const c = clock(now);
  const ids = members.map((m) => m.id);
  const ic4 = ["aaron", "odette", "cemre", "david", "vki", "kasey", "naveen"];
  const others = ids.filter((id) => !ic4.includes(id) && id !== "bolu");
  const inner: Circle[] = [1, 2, 3, 4, 5, 6, 7].map((n) => {
    const slot = n < 4 ? n - 1 : n - 2;
    return {
      id: `ic${n}`,
      type: "inner",
      name: `Inner Circle ${n}`,
      description: INNER_DESCRIPTION,
      number: n,
      imageUrl: null,
      createdBy: "bolu",
      createdAt: c.iso(-270 + n * 10),
      memberIds: n === 4 ? ic4 : others.slice(slot * 7, slot * 7 + 7),
    };
  });
  const pick = (start: number, count: number) =>
    Array.from({ length: count }, (_, i) => ids[(start + i * 3) % ids.length]!);
  const withAaron = (list: string[]) => (list.includes("aaron") ? list : ["aaron", ...list.slice(1)]);
  const circle = (
    id: string,
    type: Circle["type"],
    name: string,
    description: string,
    createdBy: string,
    memberIds: string[],
    days: number,
  ): Circle => ({
    id, type, name, description, number: null, imageUrl: null, createdBy,
    createdAt: c.iso(days), memberIds: Array.from(new Set([createdBy, ...memberIds])),
  });
  return [
    ...inner,
    circle("creative-corner", "interest", "Creative Corner", "Drawing, pottery, zines. Bring whatever you're making.", "georgios", withAaron(pick(1, 23)), -200),
    circle("padel", "interest", "Padel Crew", "Weekly doubles. All levels, loud cheering.", "aaron", pick(4, 11), -150),
    circle("book-club", "interest", "Book Club", "One book a month, one long dinner to argue about it.", "naveen", pick(2, 14), -120),
    circle("hiking", "interest", "Hiking & Outdoors", "Day trips out of Berlin. Lakes in summer, forests in winter.", "vki", pick(5, 17), -90),
    circle("kreuzberg", "location", "Kreuzberg, Neukölln & Tempelhof", "Neighbours south of the canal.", "martin", withAaron(pick(0, 30)), -210),
    circle("prenzlauer", "location", "Prenzlauer Berg & Mitte", "Coffee walks and courtyard dinners.", "aleksandra", pick(7, 19), -180),
    circle("friedrichshain", "location", "Friedrichshain & Lichtenberg", "East side, best side.", "kasey", pick(9, 15), -160),
  ];
}

function event(over: Partial<EventDetails>): EventDetails {
  return {
    date: null, startTime: null, endTime: null, address: null,
    addressVisible: true, canBringFriend: false, guestLimit: null, ...over,
  };
}

function post(over: Partial<Post> & Pick<Post, "id" | "type" | "title" | "authorId" | "publishedTo" | "createdAt">): Post {
  return {
    body: "", imageUrl: null, updatedAt: null, pinned: false, reactions: {},
    commentCount: 0, event: null, celebrantId: null, ...over,
  };
}

function buildPosts(circles: Circle[], now: Date): Post[] {
  const c = clock(now);
  const ic = (n: number) => circles.find((x) => x.id === `ic${n}`)!;
  /** Monthly inner circle dinners: past three and next one, per circle. */
  const dinners = [1, 2, 3, 4, 5, 6, 7].flatMap((n) =>
    [-84, -56, -28, 3 + n].map((offset, k) => {
      const host = ic(n).memberIds[k % ic(n).memberIds.length]!;
      return post({
        id: `dinner-ic${n}-${k}`,
        type: "event",
        title: `IC${n} dinner`,
        body: "Our monthly dinner. Host picks the menu, everyone brings a story.",
        authorId: host,
        publishedTo: [`ic${n}`],
        createdAt: c.iso(offset - 14, 9),
        event: event({ date: c.day(offset), startTime: "19:00", endTime: "22:30", address: "Host's place, sent in the group" }),
      });
    }),
  );

  return [
    post({
      id: "brunch-botanico",
      type: "event",
      title: "Sunday brunch at Café Botanico",
      body: "Garden table booked for ten. Come hungry, stay for the second pot of coffee.",
      authorId: "odette",
      publishedTo: ["ic4", "square"],
      createdAt: c.iso(-2, 10, 12),
      pinned: true,
      reactions: { "🥐": ["aaron", "cemre", "david"], "☕": ["vki", "kasey"] },
      event: event({ date: c.day(4), startTime: "11:00", endTime: "13:30", address: "Richardstraße 105, 12043 Berlin", canBringFriend: true, guestLimit: 10 }),
    }),
    post({
      id: "story-circle-33",
      type: "event",
      title: "Story Circle #33",
      body: "True stories, told live. Theme this month: \"lost and found\". Five minutes each, no notes.",
      authorId: "yetunde",
      publishedTo: ["square", "loop"],
      createdAt: c.iso(-5, 18, 40),
      reactions: { "🔥": ["aaron", "maryam", "nathaly", "martin"], "❤️": ["georgios"] },
      event: event({ date: c.day(19), startTime: "14:30", endTime: "17:30", address: "Oranienstraße 25, 10999 Berlin", canBringFriend: true, guestLimit: 30 }),
    }),
    post({
      id: "zine-night",
      type: "event",
      title: "Zine night",
      body: "Scissors, glue, a photocopier. We make one zine together by midnight.",
      authorId: "georgios",
      publishedTo: ["creative-corner"],
      createdAt: c.iso(-3, 20),
      event: event({ date: c.day(9), startTime: "19:00", endTime: "23:00", address: "Weserstraße 58, 12045 Berlin" }),
    }),
    post({
      id: "padel-doubles",
      type: "event",
      title: "Padel doubles, date TBD",
      body: "Vote for a Saturday in the comments.",
      authorId: "aaron",
      publishedTo: ["padel"],
      createdAt: c.iso(-1, 8, 30),
      event: event({ address: "Padel Berlin, Holzmarktstraße 25", addressVisible: false }),
    }),
    post({
      id: "lake-day",
      type: "event",
      title: "Lake day at Liepnitzsee",
      body: "Train from Gesundbrunnen at 9. Bring snacks to share.",
      authorId: "vki",
      publishedTo: ["hiking", "square"],
      createdAt: c.iso(-12, 9),
      reactions: { "🌊": ["aaron", "david"] },
      event: event({ date: c.day(-6), startTime: "09:00", endTime: "18:00", address: "S Gesundbrunnen" }),
    }),
    post({
      id: "offer-wheel",
      type: "offer",
      title: "Pottery wheel time on Thursdays",
      body: "I rent a studio slot but only use half. Two hours free for anyone who wants to try.",
      authorId: "maryam",
      publishedTo: ["creative-corner"],
      createdAt: c.iso(-4, 16),
      reactions: { "🙌": ["georgios", "aaron"] },
    }),
    post({
      id: "need-plants",
      type: "need",
      title: "Plant sitter for two weeks",
      body: "Away from the 10th. Twelve plants, one grumpy fig. Kreuzberg, near Görlitzer Park.",
      authorId: "martin",
      publishedTo: ["loop", "kreuzberg"],
      createdAt: c.iso(-1, 19, 5),
    }),
    post({
      id: "picnic-photos",
      type: "post",
      title: "Photos from Tempelhof",
      body: "Kites, too much hummus, one very proud dog. Thanks for coming, neighbours.",
      authorId: "nathaly",
      publishedTo: ["kreuzberg"],
      createdAt: c.iso(-7, 21),
      reactions: { "❤️": ["aaron", "martin", "maryam"] },
    }),
    post({
      id: "book-pick",
      type: "post",
      title: "October pick: Piranesi",
      body: "Short, strange and perfect for dark evenings. Dinner at mine at the end of the month.",
      authorId: "naveen",
      publishedTo: ["book-club"],
      createdAt: c.iso(-9, 11),
    }),
    post({
      id: "welcome",
      type: "post",
      title: "Welcome, new members",
      body: "Eight new faces this month. Say hi in the comments and tell us your favourite Berlin bakery.",
      authorId: "bolu",
      publishedTo: ["loop"],
      createdAt: c.iso(-3, 9),
      reactions: { "👋": ["aaron", "odette", "yetunde", "ines", "felix"] },
    }),
    ...dinners,
  ];
}

function buildComments(now: Date): Comment[] {
  const c = clock(now);
  const comment = (id: string, postId: string, authorId: string, body: string, hoursAgo: number, parentId: string | null = null, reactions = {}): Comment => ({
    id, postId, parentId, authorId, body, reactions,
    createdAt: new Date(new Date(c.iso(0, 12)).getTime() - hoursAgo * 3_600_000).toISOString(),
    updatedAt: null,
  });
  return [
    comment("c1", "brunch-botanico", "cemre", "Saving the seat by the lemon tree.", 40, null, { "😂": ["odette", "aaron"] }),
    comment("c2", "brunch-botanico", "odette", "It's yours. Bring the notebook.", 38, "c1"),
    comment("c3", "brunch-botanico", "david", "Can I bring my sister? She's visiting.", 30),
    comment("c4", "brunch-botanico", "odette", "Of course, plus-ones welcome.", 29, "c3", { "❤️": ["david"] }),
    comment("c5", "brunch-botanico", "aaron", "I'll be ten minutes late, padel runs over.", 6),
    comment("c6", "story-circle-33", "maryam", "Signing up to tell one this time!", 50),
    comment("c7", "story-circle-33", "yetunde", "Yes! You're slot three.", 48, "c6"),
    comment("c8", "padel-doubles", "kasey", "Saturday the 17th works for me.", 10),
    comment("c9", "offer-wheel", "georgios", "Taking you up on this.", 20),
    comment("c10", "welcome", "ines", "Hi all! Vote: Albatross bakery.", 30),
    comment("c11", "welcome", "felix", "Hallo! Round Bakery, no contest.", 28),
  ];
}

function buildRsvps(posts: Post[], circles: Circle[], now: Date): Rsvp[] {
  const c = clock(now);
  const rsvp = (postId: string, memberId: string, status: Rsvp["status"] = "going"): Rsvp => ({
    postId, memberId, status, updatedAt: c.iso(-1),
  });
  const dinnerRsvps = posts
    .filter((p) => p.id.startsWith("dinner-"))
    .flatMap((p) => {
      const circle = circles.find((x) => p.publishedTo.includes(x.id))!;
      return circle.memberIds.map((memberId, i) => {
        // ic2's first two members skipped the last two dinners; one skipped three.
        const k = Number(p.id.split("-").at(-1));
        const missed = circle.id === "ic2" && ((i === 0 && k >= 1 && k <= 2) || (i === 1 && k <= 2));
        return rsvp(p.id, memberId, missed || (i + k) % 9 === 8 ? "declined" : "going");
      });
    });
  return [
    ...["odette", "aaron", "cemre", "david", "vki"].map((m) => rsvp("brunch-botanico", m)),
    rsvp("brunch-botanico", "naveen", "declined"),
    ...["yetunde", "maryam", "nathaly", "martin", "georgios", "mateo", "yuki", "priya"].map((m) => rsvp("story-circle-33", m)),
    rsvp("story-circle-33", "hannah", "declined"),
    ...["georgios", "maryam", "aaron"].map((m) => rsvp("zine-night", m)),
    ...["vki", "aaron", "david", "lukas"].map((m) => rsvp("lake-day", m)),
    ...dinnerRsvps,
  ];
}

function buildFeedback(now: Date): Feedback[] {
  const c = clock(now);
  return [
    { id: "fb1", authorId: "odette", body: "Could the calendar show which dinners still have seats?", createdAt: c.iso(-3) },
    { id: "fb2", authorId: "david", body: "Loving the new feed. A dark mode toggle would be nice.", createdAt: c.iso(-9) },
  ];
}

function buildActivity(now: Date): Activity[] {
  const c = clock(now);
  const activity = (id: string, type: Activity["type"], actorId: string, subjectId: string | null, targetRoute: string, days: number, hour: number): Activity => ({
    id, type, actorId, subjectId, targetRoute, createdAt: c.iso(days, hour), readBy: [],
  });
  return [
    activity("a1", "reply", "odette", "aaron", "/events/brunch-botanico", 0, 9),
    activity("a2", "post_created", "martin", null, "/", -1, 19),
    activity("a3", "comment", "kasey", "aaron", "/", -1, 8),
    activity("a4", "member_joined", "felix", null, "/members/felix", -3, 10),
    activity("a5", "post_created", "yetunde", null, "/events/story-circle-33", -5, 18),
  ];
}

export function createSeed(now: Date = new Date()): Db {
  const members = buildMembers(now);
  const circles = buildCircles(members, now);
  const posts = buildPosts(circles, now);
  const comments = buildComments(now);
  const counts = new Map<string, number>();
  for (const cm of comments) counts.set(cm.postId, (counts.get(cm.postId) ?? 0) + 1);
  const aaronPrefs: Prefs = {
    ...defaultPrefs(CURRENT_MEMBER_ID),
    favouritePostIds: ["story-circle-33"],
  };
  return {
    members,
    circles,
    posts: posts.map((p) => ({ ...p, commentCount: counts.get(p.id) ?? 0 })),
    comments,
    rsvps: buildRsvps(posts, circles, now),
    prefs: [aaronPrefs],
    activity: buildActivity(now),
    feedback: buildFeedback(now),
    currentMemberId: CURRENT_MEMBER_ID,
  };
}
