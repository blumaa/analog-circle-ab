import type {
  Activity,
  EventItem,
  Group,
  LoopPost,
  Member,
  Membership,
  Rsvp,
  WallPost,
} from "../types";

export const ANALOG_GROUP_ID = "analog-root";
export const INNER_GROUP_ID = "ic4";
export const CURRENT_MEMBER_ID = "aaron";

export const groups: Group[] = [
  { id: ANALOG_GROUP_ID, type: "analog", name: "The Analog Circle", parentId: null },
  { id: INNER_GROUP_ID, type: "inner", name: "ic4", parentId: ANALOG_GROUP_ID },
];

/**
 * Inner circle = Aaron's core group (he's the real persona; the rest fictional).
 * The broader Analog Circle (everyone) is innerMembers + analogOnlyMembers below.
 */
const innerMembers: Member[] = [
  {
    id: "aaron",
    name: "Aaron Blum",
    email: "blumaa@gmail.com",
    photoUrl: null,
    from: "united states",
    bio: "Aaron is a former teacher and current coder who enjoys writing poems, hiking in the mountains, playing padel (addict), considering design systems, and a good laugh with friends.",
    interests: ["Design systems", "Padel", "Hiking", "Poetry"],
    dietary: "no",
    whatsappUrl: "https://wa.me/000",
    location: { lat: 52.508, lng: 13.46 },
    isReal: true,
  },
  { id: "david", name: "David", email: "david@example.com", photoUrl: "https://i.pravatar.cc/400?u=david", from: "uk", bio: "Curious generalist.", interests: ["Cooking", "Film"], dietary: "I try to avoid raw or undercooked meat and fish like sushi. Always happy to chat on this", whatsappUrl: "https://wa.me/000", location: { lat: 52.52, lng: 13.405 }, isReal: false },
  { id: "vki", name: "Vki", email: "vki@example.com", photoUrl: "https://i.pravatar.cc/400?u=vki", from: "germany", bio: "Loves long walks.", interests: ["Music"], dietary: "vegetarian", whatsappUrl: "https://wa.me/000", location: { lat: 52.49, lng: 13.36 }, isReal: false },
  { id: "kasey", name: "Kasey", email: "kasey@example.com", photoUrl: "https://i.pravatar.cc/400?u=kasey", from: "usa", bio: "Builder.", interests: ["Startups"], dietary: "-", whatsappUrl: "https://wa.me/000", location: { lat: 52.5, lng: 13.45 }, isReal: false },
  { id: "naveen", name: "Naveen", email: "naveen@example.com", photoUrl: "https://i.pravatar.cc/400?u=naveen", from: "india", bio: "Reader.", interests: ["Books"], dietary: "None", whatsappUrl: "https://wa.me/000", location: { lat: 52.46, lng: 13.55 }, isReal: false },
  { id: "cemre", name: "Cemre Nur", email: "cemre@example.com", photoUrl: "https://i.pravatar.cc/400?u=cemre", from: "turkey", bio: "Designer.", interests: ["Art"], dietary: "Thanks, no!", whatsappUrl: "https://wa.me/000", location: { lat: 52.47, lng: 13.34 }, isReal: false },
  { id: "aleksandra", name: "Aleksandra", email: "aleksandra@example.com", photoUrl: "https://i.pravatar.cc/400?u=aleksandra", from: "poland", bio: "Coffee enthusiast.", interests: ["Coffee", "Travel"], dietary: "Nope", whatsappUrl: "https://wa.me/000", location: { lat: 52.55, lng: 13.39 }, isReal: false },
  { id: "odette", name: "Odette", email: "odette@example.com", photoUrl: "https://i.pravatar.cc/400?u=odette", from: "france", bio: "Ceramicist and weekend baker.", interests: ["Ceramics", "Baking"], dietary: "Pescatarian", whatsappUrl: "https://wa.me/000", location: { lat: 52.51, lng: 13.42 }, isReal: false },
];

/**
 * Analog Circle members NOT in Aaron's inner circle — they appear in the
 * Directory (everyone) but not in inner-circle views.
 */
const ANALOG_ONLY_SEED: Array<[string, string, string[]]> = [
  ["Mateo", "spain", ["Cycling", "Photography"]],
  ["Yuki", "japan", ["Ceramics", "Tea"]],
  ["Priya", "india", ["Yoga", "Writing"]],
  ["Lukas", "austria", ["Climbing", "Synths"]],
  ["Sofia", "italy", ["Cooking", "Cinema"]],
  ["Omar", "egypt", ["Chess", "History"]],
  ["Hannah", "ireland", ["Running", "Knitting"]],
  ["Tomas", "czechia", ["Beer", "Hiking"]],
  ["Mei", "china", ["Painting", "Dance"]],
  ["Noah", "usa", ["Startups", "Surfing"]],
  ["Léa", "france", ["Poetry", "Film"]],
  ["Diego", "argentina", ["Tango", "Asado"]],
  ["Anya", "russia", ["Ballet", "Chess"]],
  ["Kwame", "ghana", ["Drums", "Football"]],
  ["Ingrid", "sweden", ["Sailing", "Design"]],
  ["Rafael", "brazil", ["Capoeira", "Guitar"]],
  ["Elif", "turkey", ["Pottery", "Travel"]],
  ["Jonas", "germany", ["Boardgames", "Brewing"]],
  ["Carmen", "mexico", ["Murals", "Salsa"]],
  ["Sven", "norway", ["Skiing", "Coffee"]],
  ["Aisha", "morocco", ["Calligraphy", "Cooking"]],
  ["Pablo", "chile", ["Astronomy", "Wine"]],
  ["Nora", "finland", ["Sauna", "Reading"]],
  ["Hassan", "lebanon", ["Oud", "Food"]],
  ["Greta", "denmark", ["Cycling", "Baking"]],
  ["Andrei", "romania", ["Coding", "Folk music"]],
  ["Maya", "israel", ["Climbing", "Design"]],
  ["Theo", "greece", ["Sailing", "Philosophy"]],
  ["Wei", "singapore", ["Hawker food", "Tech"]],
  ["Camille", "belgium", ["Chocolate", "Jazz"]],
];

const analogOnlyMembers: Member[] = ANALOG_ONLY_SEED.map(([name, from, interests], i) => {
  const id = `ac-${name.toLowerCase()}-${i}`;
  return {
    id,
    name,
    email: `${name.toLowerCase()}@example.com`,
    photoUrl: `https://i.pravatar.cc/400?u=${id}`,
    from,
    bio: `${name} is part of the wider Analog Circle community.`,
    interests,
    dietary: null,
    whatsappUrl: "https://wa.me/000",
    location: { lat: 52.5 + (i % 7) * 0.01, lng: 13.4 + (i % 5) * 0.015 },
    isReal: false,
  };
});

/** Everyone in the Analog Circle (Directory). Inner circle is the first 8. */
export const members: Member[] = [...innerMembers, ...analogOnlyMembers];

/** Only the inner circle has inner-group memberships. */
export const memberships: Membership[] = innerMembers.map((m) => ({
  memberId: m.id,
  groupId: INNER_GROUP_ID,
}));

const meetingHosts: Array<[string, string, string]> = [
  ["2026-07-04", "aaron", "July 2026"],
  ["2026-08-01", "david", "August 2026"],
  ["2026-09-05", "vki", "September 2026"],
  ["2026-10-03", "kasey", "October 2026"],
  ["2026-11-07", "naveen", "November 2026"],
  ["2027-01-02", "cemre", "January 2027"],
  ["2027-02-06", "aleksandra", "February 2027"],
  ["2027-03-06", "odette", "March 2027"],
];

const innerMeetings: EventItem[] = meetingHosts.map(([date, hostId], i) => ({
  id: `meeting-${i}`,
  scope: "inner",
  groupId: INNER_GROUP_ID,
  title: "Inner Circle meeting",
  date,
  startTime: "16:00",
  endTime: "19:00",
  hostId,
  creatorId: hostId,
  address: hostId === "aaron" ? "kiefholzstraße 26, 12435 Berlin" : null,
  guideUrl: hostId === "aaron" ? "https://gamma.app/docs/hosting-guide" : null,
  type: "meeting",
}));

/** Community-wide events visible to the whole Analog Circle. */
const ANALOG_EVENT_SEED: Array<{
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  hostId: string;
  address: string | null;
}> = [
  {
    title: "Analog Circle mixer",
    date: "2026-07-18",
    startTime: "19:00",
    endTime: "22:00",
    hostId: "aaron",
    address: "Klunkerkranich, Karl-Marx-Straße 66, 12043 Berlin",
  },
  {
    title: "Summer picnic",
    date: "2026-08-15",
    startTime: "13:00",
    endTime: "17:00",
    hostId: "david",
    address: "Treptower Park, Berlin",
  },
  {
    title: "Photography walk",
    date: "2026-09-12",
    startTime: "10:00",
    endTime: "12:30",
    hostId: "cemre",
    address: "Tempelhofer Feld, Berlin",
  },
];

const analogEvents: EventItem[] = ANALOG_EVENT_SEED.map((e, i) => ({
  id: `analog-event-${i}`,
  scope: "analog",
  groupId: ANALOG_GROUP_ID,
  title: e.title,
  date: e.date,
  startTime: e.startTime,
  endTime: e.endTime,
  hostId: e.hostId,
  creatorId: e.hostId,
  address: e.address,
  guideUrl: null,
  type: "event",
}));

export const events: EventItem[] = [...innerMeetings, ...analogEvents];

const MEETING_0_DECLINED: Array<{ memberId: string; note: string }> = [
  {
    memberId: "cemre",
    note: "Unfortunately I booked a weekend event in advance and I can't reschedule it.",
  },
  { memberId: "vki", note: "In Asia that week." },
];

export const rsvps: Rsvp[] = innerMeetings.flatMap((e) =>
  innerMembers.map((m) => {
    const declined =
      e.id === "meeting-0" ? MEETING_0_DECLINED.find((d) => d.memberId === m.id) : undefined;
    if (declined) {
      return { eventId: e.id, memberId: m.id, status: "declined" as const, note: declined.note };
    }
    return { eventId: e.id, memberId: m.id, status: "going" as const };
  }),
);

export const loopPosts: LoopPost[] = [
  {
    id: "loop-1",
    scope: "analog",
    kind: "need",
    category: "Language Help",
    body: 'Looking for a "Walkie Talkie" partner to meet occasionally to practice German. The idea is reading a 1/2 page German text before meeting, then a short walk together explaining what you learned.',
    authorId: "aleksandra",
    archived: false,
    createdAt: "2026-06-01T10:00:00.000Z",
    notes: [{ authorId: "aaron", body: "I'd love to do this — I'm a former German teacher. Let's connect!" }],
    helpedBy: ["aaron"],
  },
  {
    id: "loop-2",
    scope: "inner",
    kind: "offer",
    category: "Tech & Digital",
    body: "Happy to help anyone set up a portfolio site or review React code.",
    authorId: "aaron",
    archived: false,
    createdAt: "2026-06-05T10:00:00.000Z",
    notes: [],
    helpedBy: [],
  },
];

export const wallPosts: WallPost[] = [
  {
    id: "wall-1",
    ownerId: "aaron",
    authorId: "david",
    scope: "analog",
    body: "Great hosting last month — looking forward to July!",
    imageUrl: null,
    createdAt: "2026-06-10T10:00:00.000Z",
  },
];

/** Seed notification history (newest first). All start unread (readBy: []). */
export const activity: Activity[] = [
  {
    id: "act-1",
    type: "wall_post",
    scope: "analog",
    actorId: "david",
    subjectId: "aaron",
    targetRoute: "/innercircle/members/aaron",
    createdAt: "2026-06-17T09:30:00.000Z",
    readBy: [],
  },
  {
    id: "act-2",
    type: "event_created",
    scope: "inner",
    actorId: "odette",
    subjectId: null,
    targetRoute: "/innercircle/group/ic4",
    createdAt: "2026-06-16T14:00:00.000Z",
    readBy: [],
  },
  {
    id: "act-3",
    type: "member_joined",
    scope: "analog",
    actorId: "ac-mateo-0",
    subjectId: null,
    targetRoute: "/innercircle/members/ac-mateo-0",
    createdAt: "2026-06-15T11:15:00.000Z",
    readBy: [],
  },
  {
    id: "act-4",
    type: "loop_post",
    scope: "analog",
    actorId: "aleksandra",
    subjectId: null,
    targetRoute: "/innercircle/the-loop",
    createdAt: "2026-06-14T08:45:00.000Z",
    readBy: [],
  },
  {
    id: "act-5",
    type: "wall_post",
    scope: "inner",
    actorId: "kasey",
    subjectId: "vki",
    targetRoute: "/innercircle/members/vki",
    createdAt: "2026-06-13T18:20:00.000Z",
    readBy: [],
  },
  {
    id: "act-6",
    type: "event_created",
    scope: "inner",
    actorId: "naveen",
    subjectId: null,
    targetRoute: "/innercircle/group/ic4",
    createdAt: "2026-06-12T10:00:00.000Z",
    readBy: [],
  },
];
