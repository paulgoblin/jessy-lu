#! /bin/bash

confirm ()
{
    read ANS;
    if [ "$ANS" != "Y" ];
    then
        echo "Better luck next time.";
        exit 0;
    fi;
}

echo "Cleaning build folder";
npm run clean;

echo "Building static assets";
npm run build;

echo "Moving build contents to gh-pages";
git checkout gh-pages;
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD);
if [ "$CURRENT_BRANCH" != "gh-pages" ];
then
    echo "Could not change branches. Exiting";
    exit 0;
fi;
git pull origin gh-pages;
cp -r ./build/* .;

echo "Committing new version"
git add .;
LATEST=$(git log | grep -E 'Publish\s\d+\.\d+\.\d+' | head -n 1);
echo "Last publsih commit: $LATEST";
echo "Next version? (e.g. 1.2.3)";
read NEXT_VERSION;
echo "Commit message?";
read NEXT_MESSAGE;
PUBLISH_MESSAGE="Publish $NEXT_VERSION\n\n$NEXT_MESSAGE";
echo "Commit message:\n\n$PUBLISH_MESSAGE\n";
echo "Commit with this message? (Y/n)";
confirm;
echo "Committing new version";
git commit -m "Publish $NEXT_VERSION" -m "$NEXT_MESSAGE"

echo "Push now? (Y/n)";
confirm;

git push origin gh-pages;

echo "Going back to main";
git checkout main;