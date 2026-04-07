import * as PIXI from "pixi.js";

export const createAvatar = (
  id: string,
  isSelf: boolean,
  username?: string,
) => {
  const container = new PIXI.Container();

  // ✅ simple circle (NO image for now)
  const circle = new PIXI.Graphics();
  circle.beginFill(isSelf ? 0x00ffcc : 0xffcc00);
  circle.drawCircle(0, 0, 20);
  circle.endFill();

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