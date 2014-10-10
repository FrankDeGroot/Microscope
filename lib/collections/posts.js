Posts = new Meteor.Collection('posts');

Posts.allow({
  update: function(userId, doc) { return ownsDocument(userId, doc); },
  remove: function(userId, doc) { return ownsDocument(userId, doc); },
});

Posts.deny({
  update: function(userId, post, fieldNames) {
    // may only edit the following two fields:
    return (_.without(fieldNames, 'url', 'title').length > 0);
  }
});

validatePost = function (post) {
  var errors = {};

  // ensure the post has a title
  if (!post.title){
    throwError('Please fill in a headline');
    errors.title = 'Please fill in a headline';
  }
  
  // and a URL
  if (!post.url){
    throwError('Please fill in a URL');
    errors.url =  "Please fill in a URL";
  }

  return errors;
}

Meteor.methods({
  post: function(postAttributes) {
    check(this.userId, String);
    check(postAttributes, {
      title: String,
      url: String
    });
    
    var user = Meteor.user();
    
    // check that there are no previous posts with the same link
    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    if (postWithSameLink) {
      return {
        postExists: true,
        _id: postWithSameLink._id
      }
    }
    
    var post = _.extend(postAttributes, {
      userId: user._id, 
      author: user.username, 
      submitted: new Date(),
      commentsCount: 0,
      upvoters: [], votes: 0
    });
    
    var postId = Posts.insert(post);
    
    return {
      _id: postId
    };
  },
  
  upvote: function(postId) {
    check(postId, String);
    
    var user = Meteor.user();
    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to upvote");
    
    var affected = Posts.update({
      _id: postId, 
      upvoters: {$ne: user._id}
    }, {
      $addToSet: {upvoters: user._id},
      $inc: {votes: 1}
    });
    
    if (! affected)
      throw new Meteor.Error(422, "You weren't able to upvote that post");
  }
});