# Code review fixes

Review ke 9 points code se verify kiye gaye. Sab sach nikle (point 6 aur 8 sirf risk the, bug nahi). Saath me 3 extra bugs bhi mile aur fix kiye.

| # | Problem | Fix |
|---|---|---|
| 1 | Koi bhi `role: "admin"` bhej ke `/api/auth/register` se admin ban sakta tha, aur `/api/admin/register` public tha | Public register me sirf `donor` / `ngo`. `/api/admin/register` ab sirf login kiye hue admin ke liye. Pehla admin: `npm run seed:admin` |
| 2 | JWT ka fallback secret (`secretkey`, `default_secret`), dono jagah alag | Fallback hata diya. `JWT_SECRET` na ho (ya 16 characters se chhota ho) to server start hi nahi hota. Token ek hi helper (`utils/token.js`) se banta/verify hota hai |
| 3 | Claim ke 3 alag implementations (donation, claim, admin) | Ek hi `claim.service.claimDonation`; baaki sab usi ko call karte hain. Apni donation claim karna ab sab jagah band |
| 4 | Do NGO ek saath claim karein to dono jeet sakte the | Status check aur update ek hi atomic DB operation (`findOneAndUpdate` with `status: "Available"`) |
| 5 | Routes par role check nahi tha | Server par `requireRole`: claim/my-claims/status = sirf NGO; donation create/my-donations/cancel/delete = sirf donor; available feed = NGO/admin (login zaroori); report = donor/NGO |
| 6 | Status ke duplicate spellings (`pending`/`Pending`/`available`...) | Ek convention: `Available / Claimed / Completed / Cancelled / Expired`. Enum ab sirf yahi; purana data server start par apne aap convert hota hai |
| 7 | `isVerified` schema me nahi tha, to har NGO "pending" dikhta tha | `isVerified` hata diya. Approval sirf `status` se: `pending` / `active` / `rejected` |
| 8 | CORS default `*` | Sirf `CLIENT_URL` (comma se kai addresses). Production me `CLIENT_URL` zaroori |
| 9 | Admin ki nayi category/subcategory donor ko nahi dikhti thi | Donor form, NGO filter aur sab labels ab DB se aate hain |

## Extra bugs jo review me nahi the
- **Blocked user login kar sakta tha.** Admin "Suspend" karta tha par login aur purana token chalte rehte the. Ab login band aur token turant kaam karna band.
- **Donor `coins` khud set kar sakta tha** (request me extra field). Ab donation ke fields whitelist hain.
- **Admin login pe rate limit nahi tha.** Ab login ki tarah limit hai.

## Dhyan rakho
- `backend/.env` me `JWT_SECRET` (kam se kam 16 characters) hona chahiye, warna server band ho jayega.
- Nayi category me photo nahi hoti, to uske liye icon wala tile dikhta hai. Agar kisi category me subcategory nahi hai to donor item ka naam khud type karta hai.
- NGO sign-up abhi bhi turant `active` hota hai (approval flow chalu nahi kiya). Approval chahiye to batao.
