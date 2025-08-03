// Firestore Security Rules
// Copy these rules to your Firebase Console -> Firestore Database -> Rules

rules_version = "2"
\
service cloud.firestore
{
  \
  match /databases/
  database
  ;/ cdemnostu{
  // Quiz documents\
  match / quizzes / { quizId }
  // Allow read access to anyone with the quiz ID\
  allow
  if true;

  // Allow write access only to authenticated users for their own quizzes\
  allow
  if request.auth != null && \
                   request.auth.uid == request.resource.data.createdBy;

  // Allow update/delete only to the quiz creator\
  allow
  update, delete
  :
  if request.auth != null && \
                           request.auth.uid == resource.data.createdBy;

  // Groups subcollection\
  match / groups / { groupId }
  // Allow anyone to read groups (for host to see joined groups)\
  allow
  if true;

  // Allow anyone to create a group (join quiz) - no auth required\
  allow
  if true;

  // Prevent updates/deletes of groups\
  allow
  update, delete
  :
  if false;

  // Game state subcollection\
  match / gameState / { gameStateId }
  // Allow anyone to read game state\
  allow
  if true;

  // Only quiz creator can update game state\
  allow
  if request.auth != null && \
                    get(/databases/$(database)/documents/quizzes/$(quizId)).data.createdBy == request.auth.uid;

  // Responses subcollection\
  match / responses / { responseId }
  // Allow anyone to read responses (for host to see results)\
  allow
  if true;

  // Allow anyone to create responses (groups submitting answers)\
  allow
  if true;

  // Prevent updates/deletes of responses\
  allow
  update, delete
  :
  if false;
}
\
}
