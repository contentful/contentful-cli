Usage: contentful space import --content-file <file>

Options:
  -h, --help                 Show help                                 [boolean]
  --space-id                 ID of the destination space                [string]
  --content-file             JSON file that contains data to be import to your
                             space                           [string] [required]
  --content-model-only       Import only content types[boolean] [default: false]
  --skip-content-model       Skip importing content types and locales
                                                      [boolean] [default: false]
  --skip-locales             Skip importing locales   [boolean] [default: false]
  --skip-content-publishing  Skips content publishing. Creates content but does
                             not publish it           [boolean] [default: false]
  --no-update                Skips updating entries if they already exist
                                                      [boolean] [default: false]
  --error-log-file           Full path to the error log file            [string]
  --managementHost           Management API host
                                        [string] [default: "api.contentful.com"]
  --proxy                    Proxy configuration in HTTP auth format:
                             [http|https]://host:port or
                             [http|https]://user:password@host:port     [string]
  --config                   An optional configuration JSON file containing all
                             the options for a single run

Copyright 2017 Contentful, this is a BETA release