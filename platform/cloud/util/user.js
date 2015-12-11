// -*- mode: js; indent-tabs-mode: nil; js-basic-offset: 4 -*-
//
// This file is part of ThingEngine
//
// Copyright 2015 Giovanni Campagna <gcampagn@cs.stanford.edu>
//
// See COPYING for details

const Q = require('q');
const crypto = require('crypto');
const db = require('./db');
const model = require('../model/user');
const oauth2 = require('../model/oauth2');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleOAuthStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;

var EngineManager = require('../enginemanager');

var GOOGLE_CLIENT_ID = '739906609557-o52ck15e1ge7deb8l0e80q92mpua1p55.apps.googleusercontent.com';
var FACEBOOK_APP_ID = '979879085397010';

// The OAuth 2.0 client secret has nothing to do with security
// and everything to do with billing
// (ie, if you steal someone's client secret you can't steal his
// users but you can steal his API quota)
// We don't care about billing, so here is my client secret, right here
// in a public git repository
// Bite me
var GOOGLE_CLIENT_SECRET = 'qeNdAMaIF_9wUy6XORABCIKE';
var FACEBOOK_APP_SECRET = '770b8df05b487cb44261e7701a46c549';

// XOR these comments for testing
var THINGENGINE_ORIGIN = 'http://127.0.0.1:8080';
//var THINGENGINE_ORIGIN = 'https://thingengine.stanford.edu';

function hashPassword(salt, password) {
    return Q.nfcall(crypto.pbkdf2, password, salt, 10000, 32)
        .then(function(buffer) {
            return buffer.toString('hex');
        });
}

function makeRandom() {
    return crypto.randomBytes(32).toString('hex');
}

function authenticateGoogle(accessToken, refreshToken, profile, done) {
    db.withTransaction(function(dbClient) {
        return model.getByGoogleAccount(dbClient, profile.id).then(function(rows) {
            if (rows.length > 0)
                return rows[0];

            var username = profile.username || profile.emails[0].value;
            return model.create(dbClient, { username: username,
                                            google_id: profile.id,
                                            human_name: profile.displayName,
                                            cloud_id: makeRandom(),
                                            auth_token: makeRandom() })
                .then(function(user) {
                    return EngineManager.get().startUser(user.id, user.cloud_id, user.auth_token).then(function() {
                        // asynchronously inject google-account device
                        EngineManager.get().getEngine(user.id).then(function(engine) {
                            return engine.devices.loadOneDevice({ kind: 'google-account',
                                                                  profileId: profile.id,
                                                                  accessToken: accessToken,
                                                                  refreshToken: refreshToken }, true);
                        }).done();

                        return user;
                    });
                });
        });
    }).nodeify(done);
}

function associateGoogle(user, accessToken, refreshToken, profile, done) {
    db.withTransaction(function(dbClient) {
        return model.update(dbClient, user.id, { google_id: profile.id })
            .then(function() {
                // asynchronously inject google-account device
                EngineManager.get().getEngine(user.id).then(function(engine) {
                    return engine.devices.loadOneDevice({ kind: 'google-account',
                                                          profileId: profile.id,
                                                          accessToken: accessToken,
                                                          refreshToken: refreshToken }, true);
                }).done();

                return user;
            });
    }).nodeify(done);
}

function authenticateFacebook(accessToken, refreshToken, profile, done) {
    db.withTransaction(function(dbClient) {
        return model.getByFacebookAccount(dbClient, profile.id).then(function(rows) {
            if (rows.length > 0)
                return rows[0];

            var username = profile.username || profile.emails[0].value;
            return model.create(dbClient, { username: username,
                                            facebook_id: profile.id,
                                            human_name: profile.displayName,
                                            cloud_id: makeRandom(),
                                            auth_token: makeRandom() })
                .then(function(user) {
                    return EngineManager.get().startUser(user.id, user.cloud_id, user.auth_token).then(function() {
                        // asynchronously inject facebook device
                        EngineManager.get().getEngine(user.id).then(function(engine) {
                            return engine.devices.loadOneDevice({ kind: 'facebook',
                                                                  profileId: profile.id,
                                                                  accessToken: accessToken,
                                                                  refreshToken: refreshToken }, true);
                        }).done();

                        return user;
                    });
                });
        });
    }).nodeify(done);
}

function associateFacebook(user, accessToken, refreshToken, profile, done) {
    db.withTransaction(function(dbClient) {
        return model.update(dbClient, user.id, { facebook_id: profile.id })
            .then(function() {
                // asynchronously inject facebook device
                EngineManager.get().getEngine(user.id).then(function(engine) {
                    return engine.devices.loadOneDevice({ kind: 'facebook',
                                                          profileId: profile.id,
                                                          accessToken: accessToken,
                                                          refreshToken: refreshToken }, true);
                }).done();

                return user;
            });
    }).nodeify(done);
}

function initializePassport() {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        db.withClient(function(client) {
            return model.get(client, id);
        }).nodeify(done);
    });

    passport.use(new BearerStrategy(function(accessToken, done) {
        db.withClient(function(dbClient) {
            return model.getByAccessToken(dbClient, accessToken).then(function(rows) {
                if (rows.length < 1)
                    return [false, null];

                return [rows[0], { scope: '*' }];
            });
        }).then(function(result) {
            done(null, result[0], result[1]);
        }, function(err) {
            done(err);
        }).done();
    }));

    passport.use(new BasicStrategy(function(username, password, done) {
        db.withClient(function(dbClient) {
            return model.getByCloudId(dbClient, username).then(function(rows) {
                if (rows.length < 1 || rows[0].auth_token !== password)
                    return false;

                return rows[0];
            });
        }).nodeify(done);
    }));

    passport.use(new LocalStrategy(function(username, password, done) {
        db.withClient(function(dbClient) {
            return model.getByName(dbClient, username).then(function(rows) {
                if (rows.length < 1)
                    return [false, "An user with this username does not exist"];

                return hashPassword(rows[0].salt, password)
                    .then(function(hash) {
                        if (hash !== rows[0].password)
                            return [false, "Invalid username or password"];

            	        return [rows[0], null];
		    });
            });
        }).then(function(result) {
            done(null, result[0], { message: result[1] });
        }, function(err) {
            done(err);
        }).done();
    }));

    passport.use(new GoogleOAuthStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: THINGENGINE_ORIGIN + '/user/oauth2/google/callback',
        passReqToCallback: true,
    }, function(req, accessToken, refreshToken, profile, done) {
        if (!req.user) {
            // authenticate the user
            authenticateGoogle(accessToken, refreshToken, profile, done);
        } else {
            associateGoogle(req.user, accessToken, refreshToken, profile, done);
        }
    }));

    passport.use(new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: THINGENGINE_ORIGIN + '/user/oauth2/facebook/callback',
        enableProof: true,
        profileFields: ['id', 'displayName', 'emails'],
        passReqToCallback: true,
    }, function(req, accessToken, refreshToken, profile, done) {
        if (!req.user) {
            // authenticate the user
            authenticateFacebook(accessToken, refreshToken, profile, done);
        } else {
            associateFacebook(req.user, accessToken, refreshToken, profile, done);
        }
    }));
}


module.exports = {
    initializePassport: initializePassport,

    register: function(dbClient, username, password) {
        return model.getByName(dbClient, username).then(function(rows) {
            if (rows.length > 0)
                throw new Error("An user with this name already exists");

            var salt = makeRandom();
            var cloudId = makeRandom();
            var authToken = makeRandom();
            return hashPassword(salt, password)
                .then(function(hash) {
                    return model.create(dbClient, {
                        username: username,
                        password: hash,
                        salt: salt,
                        cloud_id: cloudId,
                        auth_token: authToken
                    });
                });
        });
    },

    update: function(dbClient, user, oldpassword, password) {
        return Q.try(function() {
            if (user.salt && user.password) {
                return hashPassword(user.salt, oldpassword)
                    .then(function(providedHash) {
                        if (user.password !== providedHash)
                            throw new Error('Invalid old password');
                    });
            }
        }).then(function() {
            var salt = makeRandom();
            return hashPassword(salt, password).then(function(newhash) {
                return model.update(dbClient, user.id, { salt: salt,
                                                         password: newhash })
                    .then(function() {
                        user.salt = salt;
                        user.password = newhash;
                    });
            });
        });
    },

    requireLogIn: function(req, res, next) {
        if (!req.user) {
            res.status(401).render('login_required',
                                   { page_title: "ThingEngine - Error" });
        } else {
            next();
        }
    },

    redirectLogIn: function(req, res, next) {
        if (!req.user) {
            req.session.redirect_to = req.originalUrl;
            res.redirect('/user/login');
        } else {
            next();
        };
    }
};
