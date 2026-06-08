import ApplicationCard from './ApplicationCard.jsx';

function ApplicationsList({ applications, selectedApplicationId, onSelect, onOpenLetter }) {
  return (
    <div className="grid gap-4">
      {applications.map((application) => (
        <ApplicationCard
          key={application.id}
          application={application}
          isSelected={application.id === selectedApplicationId}
          onSelect={onSelect}
          onOpenLetter={onOpenLetter}
        />
      ))}
    </div>
  );
}

export default ApplicationsList;
