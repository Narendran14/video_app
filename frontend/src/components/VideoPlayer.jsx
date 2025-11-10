export default function VideoPlayer({ src }) {
  if (!src) return null;
  return (
    <div className="rounded bg-black p-2">
      <video
        src={src}
        controls
        style={{ width: "100%", maxHeight: "480px" }}
      />
    </div>
  );
}
