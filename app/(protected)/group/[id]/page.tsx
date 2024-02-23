"use client";

function GroupDetails({ params }: { params: { id: string } }) {
  const id = params.id;
  return <div>Group Details for ID: {id}</div>;
}

export default GroupDetails;
