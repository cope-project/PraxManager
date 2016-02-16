# Contribute to PraxManager

This guide details how contribute to PraxManager.

## Issue tracker guidelines
Search the issues for similar entries before submitting your own, 
there's a good chance somebody else had the same issue. 
Show your support with :+1: and/or join the discussion. Please submit issues in the following format (as the first post):

1. Summary: Summarize your issue in one sentence (what goes wrong, what did you expect to happen)
1. Steps to reproduce: How can we reproduce the issue
1. Expected behavior: Describe your issue in detail
1. Observed behavior
1. Relevant logs and/or screenshots: Please use code blocks (```) to format console output, logs, and code as it's very hard to read otherwise.
1. Possible fixes: If you can, link to the line of code that might be responsible for the problem

## Merge requests

We welcome merge requests with fixes and improvements to PraxManager code, tests, and/or documentation. 
The features we would really like a merge request for are listed with the status 'accepting merge/merge requests' on our feedback forum but other improvements are also welcome.

## Merge request guidelines
If you can, please submit a merge request with the fix or improvements including tests. If you don't know how to fix the issue but can write a test that exposes the issue we will accept that as well. 
In general bug fixes that include a regression test are merged quickly while new features without proper tests are least likely to receive timely feedback. 
The workflow to make a merge request is as follows:

1. Fork the project on Github
1. Create a feature branch
1. Write code
1. Add your changes to the CHANGELOG
1. If you have multiple commits please combine them into one commit by squashing them
1. Push the commit to your fork
1. Submit a merge request (MR)
1. The MR title should describes the change you want to make
1. The MR description should give a motive for your change and the method you used to achieve it
1. If the MR changes the UI it should include before and after screenshots
1. Link relevant issues and/or feedback items from the merge request description and leave a comment on them with a link back to the MR
1. Be prepared to answer questions and incorporate feedback even if requests for this arrive weeks or months after your MR submission


Please keep the change in a single MR as small as possible. 
If you want to contribute a large feature think very hard what the minimum viable change is. 
Can you split functionality? Can you only submit the backend/API code? 
Can you start with a very simple UI? The smaller a MR is the more likely it is it will be merged, after that you can send more MR's to enhance it.

We will accept merge requests if:
* It can be merged without problems (if not please use: git rebase master)
* It does not break any existing functionality
* It is not a catch all merge request but rather fixes a specific issue or implements a specific feature
* It keeps the Github code base clean and well structured
* We think other users will benefit from the same functionality