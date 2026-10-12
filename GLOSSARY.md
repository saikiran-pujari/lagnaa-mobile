# Glossary

Canonical domain language for `lagnaa-mobile`. Use these terms in code identifiers, tests, documentation and commit messages. Avoid the alternatives listed under _Avoid_.

## Language

**Member**:
An authenticated account on Lagnaa. Owns exactly one Profile. Has a role: `USER`, `PARENT`, `ADMIN`, `SUPER_ADMIN`.
_Avoid_: user (except when naming the server's `User` record), account, customer

**Profile**:
The data describing the person seeking marriage: identity, birth details, education, career, family, lifestyle, partner preferences, photos.
_Avoid_: biodata (that is the printable export of a Profile), card

**Profile For**:
Whose Profile a Member manages: `SELF`, `MY_SON`, `MY_DAUGHTER`, `MY_BROTHER`, `MY_SISTER`.

**Viewer**:
The Member currently looking at another Member's Profile.

**Interest**:
A request from a sender Member to a receiver Member to connect. One per ordered pair. States: `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`.
_Avoid_: like, swipe, match request, proposal

**Connection**:
The relationship between two Members once an Interest between them is `ACCEPTED`. Enables chat and Contact Requests.
_Avoid_: match, friend

**Contact Request**:
A request from one Connected Member to another to reveal email and phone. States: `PENDING`, `ACCEPTED`, `REJECTED`.

**Contact Unlocked**:
The state in which a Viewer receives the Profile owner's email and phone.

**Conversation**:
A chat thread between two Connected Members.

**Message**:
A plain-text item in a Conversation, with read state.

**Shortlist**:
A Member's private list of bookmarked Members.
_Avoid_: favourite, saved, wishlist

**Profile View**:
A record that a Viewer opened a Profile.

**Block**:
A bidirectional interaction ban between two Members, created by one of them.

**Report**:
A moderation flag raised by a Member against another Member.

**Recommendation**:
A Profile the server suggests to the Viewer.
_Avoid_: match, suggestion (in code)

**Compatibility Score**:
Server-computed 0-100 fit between the Viewer's partner preferences and a Profile.

**Profile Strength**:
Client-computed 0-100 completeness of the Member's own Profile.
_Avoid_: completion (as a noun in code)

**Incomplete Profile**:
A Profile whose Strength is below 20%, or a Stub Profile. Discovery is unavailable until it is completed.

**Stub Profile**:
The placeholder Profile the server creates on Google sign-up (first name `Pending`, last name `User`).

**Visibility**:
Profile setting: `PUBLIC`, `PRIVATE`, `CONNECTIONS_ONLY`.

**Photo Privacy**:
Profile setting: `all`, `interests`, `none`.

**Verified**:
Admin-granted trust flag on a Member.

**Active Today**:
The Profile owner's last activity is within the current calendar day.

**Session**:
The pair of access and refresh tokens held in the device keychain, plus the derived state `booting`, `signedOut`, `signedIn`, `needsProfile`.

**Native Runtime**:
The store-delivered binary identified by app version, build number and fingerprint.

**OTA Bundle**:
A signed JavaScript bundle targeting one Native Runtime fingerprint.

**Channel**:
The OTA delivery lane an installed app listens to: `development`, `staging`, `production`.

**Release**:
Either a Store Release (new Native Runtime) or an OTA Release (new OTA Bundle on a Channel).

**Feature**:
A folder under `src/features/` owning the screens, hooks, queries and mutations for one product domain.

## Relationships

- A **Member** has one **Profile** and one **Profile For**.
- An **Interest** has one sender **Member** and one receiver **Member**.
- A **Connection** exists when an **Interest** between two **Members** is `ACCEPTED`.
- A **Contact Request** requires a **Connection**.
- A **Conversation** requires a **Connection** and has many **Messages**.
- A **Block** suppresses **Interests**, **Contact Requests**, **Messages**, search results and **Recommendations** between two **Members**.
- An **OTA Bundle** targets one **Native Runtime** and is published to one **Channel**.

## Flagged ambiguities

- "match" is used in the web client for both Recommendations and Connections. Resolved: **Recommendation** before any Interest exists, **Connection** after acceptance. The word "match" is not a domain term here.
- "contact" meant both a Contact Request and the revealed details. Resolved: **Contact Request** is the request; **Contact Unlocked** is the resulting state.
- "profile" vs "user" on the server: `profile.id` and `userId` are different identifiers. Interests, Contact Requests, Shortlist, Block, Report and Messages are keyed by **Member** (`userId`); Profile views and `GET /profile/:id` are keyed by Profile id. Mobile types carry both and name them `profileId` and `memberId`.
