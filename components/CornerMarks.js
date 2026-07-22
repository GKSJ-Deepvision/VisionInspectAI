export default function CornerMarks() {
  return (
    <>
      <div className="corner-mark border-t border-l" style={{ top: 0, left: 0 }} />
      <div className="corner-mark border-t border-r" style={{ top: 0, right: 0 }} />
      <div className="corner-mark border-b border-l" style={{ bottom: 0, left: 0 }} />
      <div className="corner-mark border-b border-r" style={{ bottom: 0, right: 0 }} />
    </>
  );
}
