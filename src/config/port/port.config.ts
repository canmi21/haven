export class PortConfig {
  public static getPort(): number {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 33321;
    console.log(`> Server is running on http://localhost:${port}\n`);
    return port;
  }
}