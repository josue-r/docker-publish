#!/bin/sh
# Maintaining a list of the projects contained in nx.json to allow an accurate pick one list when running tests
# Not perfect solution... would prefer a library to parse the JSON in the CLI, but didn't find a trust worthy one

# Temporarily cd to root directory (so, this script can be ran from anywhere in the work-space)
rootDirectory="$(git rev-parse --show-toplevel)"
pushd $rootDirectory

# Looking at only the section of the nx.json between the "projects" and "tasksRunnerOptions" lines
perl -0777 -ne 'print /"projects": \{(.*)"tasksRunnerOptions"/s' nx.json |
{
    # Within a subshell, external script variable changes will be lost
    projectNames=()
    projectNameRegex="\"(.*)\": \{\}?"

    # Read the piped content
    while read -r line; do
        if [[ $line =~ $projectNameRegex ]]
        then
            projectNames+=(${BASH_REMATCH[1]})
        fi
    done
    
    # Format array of project names to a comma delimited string
    printf -v formattedProjects '"%s",' "${projectNames[@]}";
    formattedProjects=${formattedProjects%,} # Remove trailing comma

    # Updating launch.json with project list using perl, sed was difficult/impossible to work with for multi-line regex replace
    perl -i -0pe "s/(\"id\": \"libraryName\"[^\[]*\"options\": \[)[^]]*]/\1$formattedProjects]/sg" .vscode/launch.json;
}

# Format updated launch.json
npm run format:launch-json

# cd back to original directory
popd
