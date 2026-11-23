#!/usr/bin/env bash
cd "$(git rev-parse --show-toplevel)"
printf '#!/usr/bin/env bash\nexec scripts/check_secrets.sh\n' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit scripts/check_secrets.sh
echo "Hook pre-commit instalado."
