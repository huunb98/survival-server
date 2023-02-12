const bcrypt = require('bcrypt');

export class BcryptHelper {
  /**
   * encode password
   * @param text
   */
  async encode(text: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(text, salt);
    return hashedPassword;
  }

  async compareHash(text: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(text, hash);
  }
}
