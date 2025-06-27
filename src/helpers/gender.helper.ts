import { Gender } from 'src/modules/users/dto/user.dto';

export const isValidGender = (gender: string): gender is Gender => {
  return Object.values(Gender).includes(gender as Gender);
};
