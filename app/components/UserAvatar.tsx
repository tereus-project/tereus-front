import { Avatar } from "@mantine/core";
import md5 from "md5";

export interface UserAvatarProps {
  email: string;
  size?: number;
}

export function UserAvatar({ email, size = 40 }: UserAvatarProps) {
  return (
    <Avatar src={`https://www.gravatar.com/avatar/${md5(email)}?s=${size * 2}`} alt="avater" radius="xl" size={size} />
  );
}
