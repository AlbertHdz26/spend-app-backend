
aws ssm put-parameter \
  --name "/expensesAppManager/auth/user" \
  --value "AlbertAdmin" \
  --type "String" \
  --overwrite



aws ssm put-parameter \
  --name "/expensesAppManager/auth/password" \
  --value "Password123!" \
  --type "String" \
  --overwrite


sam build

sam deploy