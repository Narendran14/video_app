export default function ResultsPanel({ result }) {
  if (!result) return <div>No result yet.</div>;
  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="font-semibold">Analysis Result</h3>
      <p>Label: <strong>{result.label}</strong></p>
      <p>Score: {result.score}</p>
      <details className="mt-2">
        <summary>Detections</summary>
        <pre className="whitespace-pre-wrap">{JSON.stringify(result.detections, null, 2)}</pre>
      </details>
    </div>
  );
}
