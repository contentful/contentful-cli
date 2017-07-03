Options:
  -h, --help                 Show help                                 [boolean]
  --version                  Show version number                       [boolean]
  --space-id                 space to import                            [string]
  --content-file             JSON file that contains data to be import to your
                             space                           [string] [required]
  --content-model-only       Import only content types[boolean] [default: false]
  --skip-content-model       Skip importing content types and locales
                                                      [boolean] [default: false]
  --skip-locales             Skip importing locales   [boolean] [default: false]
  --skip-content-publishing  Skips content publishing. Creates content but does
                             not publish it           [boolean] [default: false]
  --error-log-file           Full path to the error log file            [string]
  --management-host          Management API host
                                        [string] [default: "api.contentful.com"]
  --config                   An optional configuration JSON file containing all
                             the options for a single run

Copyright 2017 Contentful, this is a BETA release