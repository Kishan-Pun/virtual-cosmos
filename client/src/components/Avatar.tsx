import * as PIXI from "pixi.js";

export const createAvatar = (
  id: string,
  isSelf: boolean,
  username?: string,
  avatar?: string,
): PIXI.Container => {
  const container = new PIXI.Container();

  // ❌ REMOVE Assets.load (async)
  const circle = new PIXI.Graphics();
  circle.circle(0, 0, 20).fill(isSelf ? 0x00ffcc : 0xffcc00);

  const label = new PIXI.Text({
    text: isSelf ? "You" : username || `User-${id.slice(0, 4)}`,
    style: {
      fill: "white",
      fontSize: 12,
    },
  });

  label.anchor.set(0.5);
  label.y = -30;

  container.addChild(circle);
  container.addChild(label);

  return container;
};