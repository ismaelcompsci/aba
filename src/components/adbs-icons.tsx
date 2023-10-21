import type { IconProps } from "@tamagui/helpers-icon";
import {
  Book,
  Database,
  FileAudio,
  FileImage,
  Headphones,
  Heart,
  Library,
  Mic,
  Mic2,
  Music,
  PartyPopper,
  Podcast,
  Radio,
  Rocket,
  Rss,
  Star,
} from "@tamagui/lucide-icons";

import { LibraryIcons } from "../types/aba";

type IconMap = {
  [key in LibraryIcons]: React.NamedExoticComponent<IconProps>; // Assuming these are React components
};

export const iconMap: IconMap = {
  database: Database,
  audiobookshelf: FileAudio,
  "books-1": Library,
  "books-2": Library,
  "book-1": Book,
  "microphone-1": Mic,
  "microphone-3": Mic2,
  radio: Radio,
  podcast: Podcast,
  rss: Rss,
  headphones: Headphones,
  music: Music,
  "file-picture": FileImage,
  rocket: Rocket,
  power: PartyPopper,
  star: Star,
  heart: Heart,
};
