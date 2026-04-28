import type { Member } from "@/types/checklist";
import { colorForName } from "./palette";

function makeMember(
  id: string,
  name: string,
  email: string,
  role: Member["role"],
  status: Member["status"] = "Active",
): Member {
  return {
    id,
    name,
    email,
    role,
    status,
    avatarColor: colorForName(name),
  };
}

export const SEED_MEMBERS: Member[] = [
  makeMember("m-priya", "Priya Sharma", "priya@sharma.family", "Owner"),
  makeMember("m-arjun", "Arjun Mehta", "arjun@mehta.co", "Owner"),
  makeMember("m-meera", "Meera Sharma", "meera.sharma@gmail.com", "Family"),
  makeMember("m-rajiv", "Rajiv Mehta", "rajiv.mehta@outlook.com", "Family"),
  makeMember(
    "m-planner",
    "Anaya Kapoor",
    "anaya@thewhiteroom.in",
    "Planner",
    "Invited",
  ),
];
