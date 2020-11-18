clear();

let debug = false;

let delay = ms => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

let findAllPosts = function () {
    let posts = document.querySelectorAll("[aria-label='Actions for this post']");
    return posts;
};

let filterFirstXPosts = function (posts, numberToKeep) {
    posts = Array.from(posts);
    let keeping = posts.slice(0, numberToKeep);
    console.log("Keeping");
    console.table(keeping, ["date", "author", "text"]);
    return posts.slice(numberToKeep);
}

let constructDataContainer = function (posts) {
    let c = [];

    for (post of posts) {
        let p2 = post.parentNode; // Step up one level to container, this holds container of three dots
        let p3 = p2.previousSibling; // Step to sibling above current element, this holds author name and date
        let links = p3.getElementsByTagName('a');

        let author = "";
        let date = "";
        let firstText = "";

        try {
            author = links[0].innerText;
            date = links[1].ariaLabel;

            if (author.length < 1) {
                console.error("Found invalid post with no author", links);
            }

            firstText = p2.parentNode.parentNode.parentNode.children[2].children[0].children[0].children[0].children[0].children[0].innerText;

        } catch (e) {
            console.log(e);
        }
        

        let o = {node: post, author: author, date: date, text: firstText};
        c.push(o);
    }
    return c;
}

let deletePost = async function (domNode) {
    
    if (debug) console.log("Deleting post", domNode);

    domNode.scrollIntoView(true);
    window.scrollBy(0,-250);
    await delay(50);

    domNode.click();

    if (debug) console.log("Waiting for remove button");

    let removeButtons = [];
    let i = 0;
    while (removeButtons.length < 1) {
       await delay(200);

       removeButtons = [].slice.call(document.querySelectorAll("span")).filter(a => a.textContent === "Remove post");

       i++;
       if (i > 30) {
           break;
       }
    }
    
    if (removeButtons.length !== 1) {
        console.error("Could not find Remove Post button");
        return true;
    }

    if (debug) console.log("Found remove button", "iterations", i, removeButtons);

    removeButtons[0].click();

    if (debug) console.log("Waiting for Confirm button");

    let confirmDialogs = [];
    i = 0;
    while (confirmDialogs.length < 1) {
        await delay(1000);

        confirmDialogs = document.querySelectorAll("div[aria-label='Remove Post']");

        i++;
        if (i > 30) {
            console.log("Breaking");
           break;
        }
    }

    if (confirmDialogs.length !== 1) {
        console.error("Could not find Confirm dialog", confirmDialogs);
        return true;
    }

    let confirmButton = confirmDialogs[0].querySelectorAll("div[aria-label='Confirm']");

    if (confirmButton.length !== 1) {
        console.error("Could not find Confirm button", confirmDialogs);
        return true;
    }

    if (debug) console.log("Found Confirm button", "iterations", i, confirmDialogs);

    confirmButton[0].click();

    if (debug) console.log("Deleted successfully");

    await delay(200);
}

let deletePosts = async function (posts) {
    
    let i = 0;
    let total = posts.length;
    for (post of posts) {
        i++;
        console.log("Deleting post", post.date, post.author, "Completion:", (i*100/total) + "%");
        await deletePost(post.node);
        await delay(1000);
    }
};

let scrollToBottom = async function (times) {
    // Let's scroll to the bottom a few times to load some content
    for (let i = 0; i < times; i++) {
        window.scrollTo(0,document.body.scrollHeight);
        await delay(1000);
        console.log("Scrolling", (i*100/times) + "%")
    }
};

let main = async function () {
    let HowManyRecentPostsToKeep = 6;

    let run = true;

    await scrollToBottom((HowManyRecentPostsToKeep/2) + 2);

    let i = 0;

    while (run) {
        let posts = findAllPosts();
        let c = constructDataContainer(posts);
        
        let postsToDelete = filterFirstXPosts(c, HowManyRecentPostsToKeep);

        if (postsToDelete.length < 1 || i > 50) {
            console.log("Done, reached limit", postsToDelete.length, i);
            break;
        }

        await delay(3000); // So you can see the keeping table quickly
        
        console.table(postsToDelete, ["date", "author", "text"]);

        //deletePost(postsToDelete[1].node); // To delete a specific post, for testing only
        await deletePosts(postsToDelete); // Uncomment to this to delete all posts other that HowManyRecentPostsToKeep first

        await scrollToBottom(6);
        i++;
    }
    
}

// First open Facebook in Google Chrome
// Then open up the Facebook group you want to delete posts in
// Then open up the Devtools by pressing F12
// Then go to tab Sources > Snippets > Create a new snippet
// Then Run this script (ctrl+enter) once and check that it works and the table you see in the console only contains posts you want to delete
// WARNING: YOU ARE RESPONSIBLE FOR ANY ACTIONS THIS SCRIPT MIGHT PERFORM
// WARNING: IF FACEBOOK CHANGES THEIR DESIGN IT MIGHT HAVE UNINTENDED CONSEQUENCES
// WARNING: NEVER RUN THIS SCRIPT PRIOR TO HAVING REVIEWED AND APPROVED THE SOURCE CODE THAT IT DOES EXACTLY WHAT YOU WANT IT TO DO
// WARNING: AUTHOR TAKES NOT RESPONSIBILITY AND IS NOT RESPONSIBLE IN ANY WAY
// WARNING: Then uncomment the //deletePosts() line to delete the posts and run this script again
// Monitor the script while running and restart the browser when it doesn't do any good any more, some posts can't be deleted via this script

main();

