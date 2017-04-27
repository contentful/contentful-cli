module.exports = {
  'contentTypes': [
    {
      'sys': {
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'id': '1kUEViTN4EmGiEaaeC6ouY',
        'type': 'ContentType',
        'createdAt': '2017-04-26T11:59:21.999Z',
        'updatedAt': '2017-04-26T11:59:23.294Z',
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedCounter': 1,
        'version': 2,
        'publishedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedVersion': 1,
        'firstPublishedAt': '2017-04-26T11:59:23.271Z',
        'publishedAt': '2017-04-26T11:59:23.271Z'
      },
      'displayField': 'name',
      'name': 'Author',
      'description': null,
      'fields': [
        {
          'id': 'name',
          'name': 'Name',
          'type': 'Symbol',
          'localized': false,
          'required': true,
          'validations': [],
          'disabled': false,
          'omitted': false
        },
        {
          'id': 'website',
          'name': 'Website',
          'type': 'Symbol',
          'localized': false,
          'required': false,
          'validations': [],
          'disabled': false,
          'omitted': false
        },
        {
          'id': 'profilePhoto',
          'name': 'Profile Photo',
          'type': 'Link',
          'localized': false,
          'required': false,
          'validations': [
            {
              'linkMimetypeGroup': 'image'
            }
          ],
          'disabled': false,
          'omitted': false,
          'linkType': 'Asset'
        },
        {
          'id': 'biography',
          'name': 'Biography',
          'type': 'Text',
          'localized': false,
          'required': false,
          'validations': [
            {
              'size': {
                'min': 0,
                'max': 1000
              }
            }
          ],
          'disabled': false,
          'omitted': false
        },
        {
          'id': 'createdEntries',
          'name': 'Created Entries',
          'type': 'Array',
          'localized': false,
          'required': false,
          'validations': [],
          'disabled': false,
          'omitted': false,
          'items': {
            'type': 'Link',
            'validations': [
              {
                'linkContentType': [
                  '2wKn6yEnZewu2SCCkus4as'
                ]
              }
            ],
            'linkType': 'Entry'
          }
        }
      ]
    },
    {
      'sys': {
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'id': '2wKn6yEnZewu2SCCkus4as',
        'type': 'ContentType',
        'createdAt': '2017-04-26T11:59:22.006Z',
        'updatedAt': '2017-04-26T11:59:23.319Z',
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedCounter': 1,
        'version': 2,
        'publishedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedVersion': 1,
        'firstPublishedAt': '2017-04-26T11:59:23.288Z',
        'publishedAt': '2017-04-26T11:59:23.288Z'
      },
      'displayField': 'title',
      'name': 'Post',
      'description': null,
      'fields': [
        {
          'id': 'title',
          'name': 'Title',
          'type': 'Text',
          'localized': false,
          'required': true,
          'validations': [],
          'disabled': false,
          'omitted': false
        },
        {
          'id': 'slug',
          'name': 'Slug',
          'type': 'Symbol',
          'localized': false,
          'required': false,
          'validations': [],
          'disabled': false,
          'omitted': false
        },
        {
          'id': 'author',
          'name': 'Author',
          'type': 'Array',
          'localized': false,
          'required': true,
          'validations': [],
          'disabled': false,
          'omitted': false,
          'items': {
            'type': 'Link',
            'validations': [
              {
                'linkContentType': [
                  '1kUEViTN4EmGiEaaeC6ouY'
                ]
              }
            ],
            'linkType': 'Entry'
          }
        },
        {
          'id': 'body',
          'name': 'Body',
          'type': 'Text',
          'localized': false,
          'required': false,
          'validations': [],
          'disabled': false,
          'omitted': false
        },
        {
          'id': 'category',
          'name': 'Category',
          'type': 'Array',
          'localized': false,
          'required': false,
          'validations': [],
          'disabled': false,
          'omitted': false,
          'items': {
            'type': 'Link',
            'validations': [
              {
                'linkContentType': [
                  '5KMiN6YPvi42icqAUQMCQe'
                ]
              }
            ],
            'linkType': 'Entry'
          }
        },
        {
          'id': 'tags',
          'name': 'Tags',
          'type': 'Array',
          'localized': false,
          'required': false,
          'validations': [],
          'disabled': false,
          'omitted': false,
          'items': {
            'type': 'Symbol',
            'validations': []
          }
        },
        {
          'id': 'featuredImage',
          'name': 'Featured image',
          'type': 'Link',
          'localized': false,
          'required': false,
          'validations': [
            {
              'linkMimetypeGroup': 'image'
            }
          ],
          'disabled': false,
          'omitted': false,
          'linkType': 'Asset'
        },
        {
          'id': 'date',
          'name': 'Date',
          'type': 'Date',
          'localized': false,
          'required': false,
          'validations': [],
          'disabled': false,
          'omitted': false
        },
        {
          'id': 'comments',
          'name': 'Comments',
          'type': 'Boolean',
          'localized': false,
          'required': false,
          'validations': [],
          'disabled': false,
          'omitted': false
        }
      ]
    },
    {
      'sys': {
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'id': '5KMiN6YPvi42icqAUQMCQe',
        'type': 'ContentType',
        'createdAt': '2017-04-26T11:59:22.151Z',
        'updatedAt': '2017-04-26T11:59:23.397Z',
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedCounter': 1,
        'version': 2,
        'publishedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedVersion': 1,
        'firstPublishedAt': '2017-04-26T11:59:23.373Z',
        'publishedAt': '2017-04-26T11:59:23.373Z'
      },
      'displayField': 'title',
      'name': 'Category',
      'description': null,
      'fields': [
        {
          'id': 'title',
          'name': 'Title',
          'type': 'Symbol',
          'localized': false,
          'required': true,
          'validations': [],
          'disabled': false,
          'omitted': false
        },
        {
          'id': 'shortDescription',
          'name': 'Short description',
          'type': 'Text',
          'localized': false,
          'required': false,
          'validations': [],
          'disabled': true,
          'omitted': false
        },
        {
          'id': 'icon',
          'name': 'Icon',
          'type': 'Link',
          'localized': false,
          'required': false,
          'validations': [
            {
              'linkMimetypeGroup': 'image'
            }
          ],
          'disabled': false,
          'omitted': false,
          'linkType': 'Asset'
        }
      ]
    }
  ],
  'entries': [
    {
      'sys': {
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'id': '1asN98Ph3mUiCYIYiiqwko',
        'type': 'Entry',
        'createdAt': '2017-04-26T11:59:27.963Z',
        'updatedAt': '2017-04-26T11:59:34.080Z',
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedCounter': 1,
        'version': 2,
        'publishedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedVersion': 1,
        'firstPublishedAt': '2017-04-26T11:59:34.043Z',
        'publishedAt': '2017-04-26T11:59:34.043Z',
        'contentType': {
          'sys': {
            'type': 'Link',
            'linkType': 'ContentType',
            'id': '2wKn6yEnZewu2SCCkus4as'
          }
        }
      },
      'fields': {
        'title': {
          'en-US': 'Down the Rabbit Hole'
        },
        'slug': {
          'en-US': 'down-the-rabbit-hole'
        },
        'author': {
          'en-US': [
            {
              'sys': {
                'type': 'Link',
                'linkType': 'Entry',
                'id': '6EczfGnuHCIYGGwEwIqiq2'
              }
            }
          ]
        },
        'body': {
          'en-US': "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversation?'\n\nSo she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy- chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.\n\nThere was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, `Oh dear! Oh dear! I shall be late!' (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually took a watch out of its waistcoat- pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.\n\nIn another moment down went Alice after it, never once considering how in the world she was to get out again.\n\nThe rabbit-hole went straight on like a tunnel for some way, and then dipped suddenly down, so suddenly that Alice had not a moment to think about stopping herself before she found herself falling down a very deep well.\n\nEither the well was very deep, or she fell very slowly, for she had plenty of time as she went down to look about her and to wonder what was going to happen next. First, she tried to look down and make out what she was coming to, but it was too dark to see anything; then she looked at the sides of the well, and noticed that they were filled with cupboards and book-shelves; here and there she saw maps and pictures hung upon pegs. She took down a jar from one of the shelves as she passed; it was labelled 'ORANGE MARMALADE', but to her great disappointment it was empty: she did not like to drop the jar for fear of killing somebody, so managed to put it into one of the cupboards as she fell past it.\n\n'Well!' thought Alice to herself, 'after such a fall as this, I shall think nothing of tumbling down stairs! How brave they'll all think me at home! Why, I wouldn't say anything about it, even if I fell off the top of the house!' (Which was very likely true.)\n\nDown, down, down. Would the fall never come to an end! 'I wonder how many miles I've fallen by this time?' she said aloud. 'I must be getting somewhere near the centre of the earth. Let me see: that would be four thousand miles down , I think--'(for, you see, Alice had learnt several things of this sort in her lessons in the schoolroom, and though this was not a very good opportunity for showing off her knowledge, as there was no one to listen to her, still it was good practice to say it over) '--yes, that's about the right distance--but then I wonder what Latitude or Longitude I've got to?' (Alice had no idea what Latitude was, or Longitude either, but thought they were nice grand words to say .)\n\nPresently she began again. 'I wonder if I shall fall right through the earth! How funny it'll seem to come out among the people that walk with their heads downward! The Antipathies, I think--' (she was rather glad there was no one listening, this time, as it didn't sound at all the right word) '--but I shall have to ask them what the name of the country is, you know. Please, Ma' am, is this New Zealand or Australia?' (and she tried to curtsey as she spoke-- fancy curtseying as you're falling through the air! Do you think you could manage it?) 'And what an ignorant little girl she'll think me for asking! No, it'll never do to ask: perhaps I shall see it written up somewhere.'\n\nDown, down, down. There was nothing else to do, so Alice soon began talking again. 'Dinah'll miss me very much to-night, I should think!' (Dinah was the cat.) 'I hope they'll remember her saucer of milk at tea-time. Dinah my dear! I wish you were down here with me! There are no mice in the air, I'm afraid, but you might catch a bat, and that's very like a mouse, you know. But do cats eat bats, I wonder?' And here Alice began to get rather sleepy, and went on saying to herself, in a dreamy sort of way, `Do cats eat bats? Do cats eat bats?' and sometimes, 'Do bats eat cats?' for, you see, as she couldn't answer either question, it didn't much matter which way she put it. She felt that she was dozing off, and had just begun to dream that she was walking hand in hand with Dinah, and saying to her very earnestly, 'Now, Dinah, tell me the truth: did you ever eat a bat?' when suddenly, thump! thump! down she came upon a heap of sticks and dry leaves, and the fall was over.\n\nAlice was not a bit hurt, and she jumped up on to her feet in a moment: she looked up, but it was all dark overhead; before her was another long passage, and the White Rabbit was still in sight, hurrying down it. There was not a moment to be lost: away went Alice like the wind, and was just in time to hear it say, as it turned a corner, 'Oh my ears and whiskers, how late it's getting!' She was close behind it when she turned the corner, but the Rabbit was no longer to be seen: she found herself in a long, low hall, which was lit up by a row of lamps hanging from the roof.\n\nThere were doors all round the hall, but they were all locked; and when Alice had been all the way down one side and up the other, trying every door, she walked sadly down the middle, wondering how she was ever to get out again.\n\nSuddenly she came upon a little three-legged table, all made of solid glass; there was nothing on it except a tiny golden key, and Alice's first thought was that it might belong to one of the doors of the hall; but, alas! either the locks were too large, or the key was too small, but at any rate it would not open any of them. However, on the second time round, she came upon a low curtain she had not noticed before, and behind it was a little door about fifteen inches high: she tried the little golden key in the lock, and to her great delight it fitted!\n\nAlice opened the door and found that it led into a small passage, not much larger than a rat-hole: she knelt down and looked along the passage into the loveliest garden you ever saw. How she longed to get out of that dark hall, and wander about among those beds of bright flowers and those cool fountains, but she could not even get her head though the doorway; 'and even if my head would go through,' thought poor Alice, 'it would be of very little use without my shoulders. Oh, how I wish I could shut up like a telescope! I think I could, if I only know how to begin.' For, you see, so many out-of-the-way things had happened lately, that Alice had begun to think that very few things indeed were really impossible.\n\n There seemed to be no use in waiting by the little door, so she went back to the table, half hoping she might find another key on it, or at any rate a book of rules for shutting people up like telescopes: this time she found a little bottle on it, ('which certainly was not here before,' said Alice,) and round the neck of the bottle was a paper label, with the words 'DRINK ME' beautifully printed on it in large letters.\n\nIt was all very well to say 'Drink me,' but the wise little Alice was not going to do that in a hurry. 'No, I'll look first,' she said, 'and see whether it's marked \"poison\" or not'; for she had read several nice little histories about children who had got burnt, and eaten up by wild beasts and other unpleasant things, all because they would not remember the simple rules their friends had taught them: such as, that a red-hot poker will burn you if you hold it too long; and that if you cut your finger very deeply with a knife, it usually bleeds; and she had never forgotten that, if you drink much from a bottle marked `poison,' it is almost certain to disagree with you, sooner or later.\n\nHowever, this bottle was NOT marked 'poison,' so Alice ventured to taste it, and finding it very nice, (it had, in fact, a sort of mixed flavour of cherry- tart, custard, pine-apple, roast turkey, toffee, and hot buttered toast,) she very soon finished it off.\n\n     *       *       *       *       *       *       *\n\n         *       *       *       *       *       *\n\n     *       *       *       *       *       *       *\n'What a curious feeling!' said Alice; 'I must be shutting up like a telescope .'\n\nAnd so it was indeed: she was now only ten inches high, and her face brightened up at the thought that she was now the right size for going though the little door into that lovely garden. First, however, she waited for a few minutes to see if she was going to shrink any further: she felt a little nervous about this; 'for it might end, you know,' said Alice to herself, 'in my going out altogether, like a candle. I wonder what I should be like then?' And she tried to fancy what the flame of a candle is like after the candle is blown out, for she could not remember ever having seen such a thing.\n\nAfter a while, finding that nothing more happened, she decided on going into the garden at once; but, alas for poor Alice! when she got to the door, she found he had forgotten the little golden key, and when she went back to the table for it, she found she could not possibly reach it: she could see it quite plainly through the glass, and she tried her best to climb up one of the legs of the table, but it was too slippery; and when she had tired herself out with trying, the poor little thing sat down and cried.\n\n'Come, there's no use in crying like that!' said Alice to herself, rather sharply; 'I advise you to leave off this minute!' She generally gave herself very good advice, (though she very seldom followed it), and sometimes she scolded herself so severely as to bring tears into her eyes; and once she remembered trying to box her own ears for having cheated herself in a game of croquet she was playing against herself, for this curious child was very fond of pretending to be two people. `But it's no use now,' thought poor Alice, 'to pretend to be two people! Why, there's hardly enough of me left to make ONE respectable person!'\n\nSoon her eye fell on a little glass box that was lying under the table: she opened it, and found in it a very small cake, on which the words `EAT ME' were beautifully marked in currants. 'Well, I'll eat it,' said Alice, 'and if it makes me grow larger, I can reach the key; and if it makes me grow smaller, I can creep under the door; so either way I'll get into the garden, and I don't care which happens!'\n\nShe ate a little bit, and said anxiously to herself, 'Which way? Which way?', holding her hand on the top of her head to feel which way it was growing, and she was quite surprised to find that she remained the same size: to be sure, this generally happens when one eats cake, but Alice had got so much into the way of expecting nothing but out-of-the-way things to happen, that it seemed quite dull and stupid for life to go on in the common way.\n\nSo she set to work, and very soon finished off the cake.\n\n     *       *       *       *       *       *       *\n\n         *       *       *       *       *       *\n\n     *       *       *       *       *       *       *"
        },
        'category': {
          'en-US': [
            {
              'sys': {
                'type': 'Link',
                'linkType': 'Entry',
                'id': '6XL7nwqRZ6yEw0cUe4y0y6'
              }
            },
            {
              'sys': {
                'type': 'Link',
                'linkType': 'Entry',
                'id': 'FJlJfypzaewiwyukGi2kI'
              }
            }
          ]
        },
        'tags': {
          'en-US': [
            'Literature',
            'fantasy',
            'children',
            'novel',
            'fiction',
            'animals',
            'rabbit',
            'girl'
          ]
        },
        'featuredImage': {
          'en-US': {
            'sys': {
              'type': 'Link',
              'linkType': 'Asset',
              'id': 'bXvdSYHB3Guy2uUmuEco8'
            }
          }
        },
        'date': {
          'en-US': '1865-11-26'
        },
        'comments': {
          'en-US': false
        }
      }
    },
    {
      'sys': {
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'id': '6EczfGnuHCIYGGwEwIqiq2',
        'type': 'Entry',
        'createdAt': '2017-04-26T11:59:28.189Z',
        'updatedAt': '2017-04-26T11:59:34.032Z',
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedCounter': 1,
        'version': 2,
        'publishedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedVersion': 1,
        'firstPublishedAt': '2017-04-26T11:59:33.997Z',
        'publishedAt': '2017-04-26T11:59:33.997Z',
        'contentType': {
          'sys': {
            'type': 'Link',
            'linkType': 'ContentType',
            'id': '1kUEViTN4EmGiEaaeC6ouY'
          }
        }
      },
      'fields': {
        'name': {
          'en-US': 'Lewis Carroll'
        },
        'website': {
          'en-US': 'http://en.wikipedia.org/wiki/Lewis_Carroll'
        },
        'profilePhoto': {
          'en-US': {
            'sys': {
              'type': 'Link',
              'linkType': 'Asset',
              'id': '2ReMHJhXoAcy4AyamgsgwQ'
            }
          }
        },
        'biography': {
          'en-US': "Charles Lutwidge Dodgson (27 January 1832 – 14 January 1898), better known by his pen name, Lewis Carroll, was an English writer, mathematician, logician, Anglican deacon and photographer. \n\nHis most famous writings are Alice's Adventures in Wonderland, its sequel Through the Looking-Glass, which includes the poem Jabberwocky, and the poem The Hunting of the Snark, all examples of the genre of literary nonsense. \n\nHe is noted for his facility at word play, logic, and fantasy. There are societies in many parts of the world (including the United Kingdom, Japan, the United States, and New Zealand[3]) dedicated to the enjoyment and promotion of his works and the investigation of his life. In 1982, his great-nephew unveiled his memorial stone in Poets' Corner, Westminster Abbey."
        },
        'createdEntries': {
          'en-US': [
            {
              'sys': {
                'type': 'Link',
                'linkType': 'Entry',
                'id': '1asN98Ph3mUiCYIYiiqwko'
              }
            }
          ]
        }
      }
    },
    {
      'sys': {
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'id': 'FJlJfypzaewiwyukGi2kI',
        'type': 'Entry',
        'createdAt': '2017-04-26T11:59:28.197Z',
        'updatedAt': '2017-04-26T11:59:34.020Z',
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedCounter': 1,
        'version': 2,
        'publishedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedVersion': 1,
        'firstPublishedAt': '2017-04-26T11:59:33.984Z',
        'publishedAt': '2017-04-26T11:59:33.984Z',
        'contentType': {
          'sys': {
            'type': 'Link',
            'linkType': 'ContentType',
            'id': '5KMiN6YPvi42icqAUQMCQe'
          }
        }
      },
      'fields': {
        'title': {
          'en-US': 'Children'
        },
        'shortDescription': {
          'en-US': 'Blog posts featuring children novels and entertaining stories involving kids.'
        },
        'icon': {
          'en-US': {
            'sys': {
              'type': 'Link',
              'linkType': 'Asset',
              'id': '6JCShApjO0O4CUkUKAKAaS'
            }
          }
        }
      }
    },
    {
      'sys': {
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'id': '6XL7nwqRZ6yEw0cUe4y0y6',
        'type': 'Entry',
        'createdAt': '2017-04-26T11:59:28.203Z',
        'updatedAt': '2017-04-26T11:59:34.008Z',
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedCounter': 1,
        'version': 2,
        'publishedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedVersion': 1,
        'firstPublishedAt': '2017-04-26T11:59:33.972Z',
        'publishedAt': '2017-04-26T11:59:33.972Z',
        'contentType': {
          'sys': {
            'type': 'Link',
            'linkType': 'ContentType',
            'id': '5KMiN6YPvi42icqAUQMCQe'
          }
        }
      },
      'fields': {
        'title': {
          'en-US': 'Literature'
        },
        'shortDescription': {
          'en-US': 'Blog posts featuring extracts from classical books, new novels and literary criticism.'
        },
        'icon': {
          'en-US': {
            'sys': {
              'type': 'Link',
              'linkType': 'Asset',
              'id': '5Q6yYElPe8w8AEsKeki4M4'
            }
          }
        }
      }
    },
    {
      'sys': {
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'id': '5JQ715oDQW68k8EiEuKOk8',
        'type': 'Entry',
        'createdAt': '2017-04-26T11:59:28.231Z',
        'updatedAt': '2017-04-26T11:59:34.060Z',
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedCounter': 1,
        'version': 2,
        'publishedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedVersion': 1,
        'firstPublishedAt': '2017-04-26T11:59:34.014Z',
        'publishedAt': '2017-04-26T11:59:34.014Z',
        'contentType': {
          'sys': {
            'type': 'Link',
            'linkType': 'ContentType',
            'id': '1kUEViTN4EmGiEaaeC6ouY'
          }
        }
      },
      'fields': {
        'name': {
          'en-US': 'Mike Springer'
        },
        'website': {
          'en-US': 'https://plus.google.com/+openculture/posts'
        },
        'profilePhoto': {
          'en-US': {
            'sys': {
              'type': 'Link',
              'linkType': 'Asset',
              'id': '2xA3oKlZTuQ0Wgs2Wm2Mkk'
            }
          }
        },
        'biography': {
          'en-US': 'Mike Springer is a journalist living in Cambridge, Massachusetts, he writes daily for Open Culture.'
        },
        'createdEntries': {
          'en-US': [
            {
              'sys': {
                'type': 'Link',
                'linkType': 'Entry',
                'id': 'A96usFSlY4G0W4kwAqswk'
              }
            }
          ]
        }
      }
    },
    {
      'sys': {
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'id': 'A96usFSlY4G0W4kwAqswk',
        'type': 'Entry',
        'createdAt': '2017-04-26T11:59:28.253Z',
        'updatedAt': '2017-04-26T11:59:34.050Z',
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedCounter': 1,
        'version': 2,
        'publishedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedVersion': 1,
        'firstPublishedAt': '2017-04-26T11:59:34.016Z',
        'publishedAt': '2017-04-26T11:59:34.016Z',
        'contentType': {
          'sys': {
            'type': 'Link',
            'linkType': 'ContentType',
            'id': '2wKn6yEnZewu2SCCkus4as'
          }
        }
      },
      'fields': {
        'title': {
          'en-US': 'Seven Tips From Ernest Hemingway on How to Write Fiction'
        },
        'slug': {
          'en-US': 'seven-tips-from-ernest-hemingway-on-how-to-write-fiction'
        },
        'author': {
          'en-US': [
            {
              'sys': {
                'type': 'Link',
                'linkType': 'Entry',
                'id': '5JQ715oDQW68k8EiEuKOk8'
              }
            }
          ]
        },
        'body': {
          'en-US': '### To get started, write one true sentence\n\nSometimes when I was starting a new story and I could not get it going, I would sit in front of the fire and squeeze the peel of the little oranges into the edge of the flame and watch the sputter of blue that they made. I would stand and look out over the roofs of Paris and think, “Do not worry. You have always written before and you will write now. All you have to do is write one true sentence. Write the truest sentence that you know.”\n\nSo finally I would write one true sentence, and then go on from there. It was easy then because there was always one true sentence that I knew or had seen or had heard someone say. If I started to write elaborately, or like someone introducing or presenting something, I found that I could cut that scrollwork or ornament out and throw it away and start with the first true simple declarative sentence I had written.\n\n\n### Always stop for the day while you still know what will happen next\n\nThe best way is always to stop when you are going good and when you know what will happen next. If you do that every day when you are writing a novel you will never be stuck. That is the most valuable thing I can tell you so try to remember it.\n\n\n### Never think about the story when you’re not working\n\nWhen I was writing, it was necessary for me to read after I had written. If you kept thinking about it, you would lose the thing you were writing before you could go on with it the next day. It was necessary to get exercise, to be tired in the body, and it was very good to make love with whom you loved.\n\nThat was better than anything. But afterwards, when you were empty, it was necessary to read in order not to think or worry about your work until you could do it again. I had learned already never to empty the well of my writing, but always to stop when there was still something there in the deep part of the well, and let it refill at night from the springs that fed it.\n\n\n### When it’s time to work again, always start by reading what you’ve written so far\n\nThe best way is to read it all every day from the start, correcting as you go along, then go on from where you stopped the day before. When it gets so long that you can’t do this every day read back two or three chapters each day; then each week read it all from the start. That’s how you make it all of one piece.\n\n\n### Don’t describe an emotion–make it\n\nI was trying to write then and I found the greatest difficulty, aside from knowing truly what you really felt, rather than what you were supposed to feel, and had been taught to feel, was to put down what really happened in action; what the actual things were which produced the emotion that you experienced. In writing for a newspaper you told what happened and, with one trick and another, you communicated the emotion aided by the element of timeliness which gives a certain emotion to any account of something that has happened on that day; but the real thing, the sequence of motion and fact which made the emotion and which would be as valid in a year or in ten years or, with luck and if you stated it purely enough, always, was beyond me and I was working very hard to get it.\n\n\n### Use a pencil\n\nWhen you start to write you get all the kick and the reader gets none. So you might as well use a typewriter because it is that much easier and you enjoy it that much more. After you learn to write your whole object is to convey everything, every sensation, sight, feeling, place and emotion to the reader. To do this you have to work over what you write.\n\nIf you write with a pencil you get three different sights at it to see if the reader is getting what you want him to. First when you read it over; then when it is typed you get another chance to improve it, and again in the proof. Writing it first in pencil gives you one-third more chance to improve it. That is .333 which is a damned good average for a hitter. It also keeps it fluid longer so you can better it easier.\n\n\n### Be brief\n\nIt wasn’t by accident that the Gettysburg address was so short. The laws of prose writing are as immutable as those of flight, of mathematics, of physics.\n\nThe original, unabbreviated version of the blog post can be found on the [Open Culture](http://www.openculture.com/) website.'
        },
        'category': {
          'en-US': [
            {
              'sys': {
                'type': 'Link',
                'linkType': 'Entry',
                'id': '6XL7nwqRZ6yEw0cUe4y0y6'
              }
            }
          ]
        },
        'comments': {
          'en-US': false
        }
      }
    }
  ],
  'assets': [
    {
      'sys': {
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'id': '2ReMHJhXoAcy4AyamgsgwQ',
        'type': 'Asset',
        'createdAt': '2017-04-26T11:59:24.606Z',
        'updatedAt': '2017-04-26T11:59:27.257Z',
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedCounter': 1,
        'version': 3,
        'publishedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedVersion': 2,
        'firstPublishedAt': '2017-04-26T11:59:27.238Z',
        'publishedAt': '2017-04-26T11:59:27.238Z'
      },
      'fields': {
        'title': {
          'en-US': 'Lewis Carroll'
        },
        'description': {
          'en-US': 'Taken on January 1, 1855'
        },
        'file': {
          'en-US': {
            'url': '//images.contentful.com/uvc269yunsnm/2ReMHJhXoAcy4AyamgsgwQ/efb82d46f1782c1b76aa0c691db371d4/lewis-carroll-1.jpg',
            'details': {
              'size': 21113,
              'image': {
                'width': 300,
                'height': 250
              }
            },
            'fileName': 'lewis-carroll-1.jpg',
            'contentType': 'image/jpeg'
          }
        }
      }
    },
    {
      'sys': {
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'id': 'bXvdSYHB3Guy2uUmuEco8',
        'type': 'Asset',
        'createdAt': '2017-04-26T11:59:24.626Z',
        'updatedAt': '2017-04-26T11:59:27.364Z',
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedCounter': 1,
        'version': 3,
        'publishedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedVersion': 2,
        'firstPublishedAt': '2017-04-26T11:59:27.345Z',
        'publishedAt': '2017-04-26T11:59:27.345Z'
      },
      'fields': {
        'title': {
          'en-US': 'Alice in Wonderland'
        },
        'file': {
          'en-US': {
            'url': '//images.contentful.com/uvc269yunsnm/bXvdSYHB3Guy2uUmuEco8/0dbc41284b470b4e35f4b3043f920daa/alice-in-wonderland.gif',
            'details': {
              'size': 24238,
              'image': {
                'width': 644,
                'height': 610
              }
            },
            'fileName': 'alice-in-wonderland.gif',
            'contentType': 'image/gif'
          }
        }
      }
    },
    {
      'sys': {
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'id': '5Q6yYElPe8w8AEsKeki4M4',
        'type': 'Asset',
        'createdAt': '2017-04-26T11:59:24.631Z',
        'updatedAt': '2017-04-26T11:59:27.174Z',
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedCounter': 1,
        'version': 3,
        'publishedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedVersion': 2,
        'firstPublishedAt': '2017-04-26T11:59:27.166Z',
        'publishedAt': '2017-04-26T11:59:27.166Z'
      },
      'fields': {
        'title': {
          'en-US': 'Pen icon'
        },
        'description': {
          'en-US': 'Icon set for categories'
        },
        'file': {
          'en-US': {
            'url': '//images.contentful.com/uvc269yunsnm/5Q6yYElPe8w8AEsKeki4M4/418e0136c6d9bac218062a78baaccf0d/Streamline-28-64.png',
            'details': {
              'size': 1423,
              'image': {
                'width': 64,
                'height': 64
              }
            },
            'fileName': 'Streamline-28-64.png',
            'contentType': 'image/png'
          }
        }
      }
    },
    {
      'sys': {
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'id': '6JCShApjO0O4CUkUKAKAaS',
        'type': 'Asset',
        'createdAt': '2017-04-26T11:59:24.636Z',
        'updatedAt': '2017-04-26T11:59:27.297Z',
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedCounter': 1,
        'version': 3,
        'publishedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedVersion': 2,
        'firstPublishedAt': '2017-04-26T11:59:27.286Z',
        'publishedAt': '2017-04-26T11:59:27.286Z'
      },
      'fields': {
        'title': {
          'en-US': 'Letter cubes'
        },
        'description': {
          'en-US': 'Category icon set'
        },
        'file': {
          'en-US': {
            'url': '//images.contentful.com/uvc269yunsnm/6JCShApjO0O4CUkUKAKAaS/78c4dc8776369d33c91ad922436ad1b4/letter-cubes.png',
            'details': {
              'size': 3905,
              'image': {
                'width': 256,
                'height': 256
              }
            },
            'fileName': 'letter-cubes.png',
            'contentType': 'image/png'
          }
        }
      }
    },
    {
      'sys': {
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'id': '3S1ngcWajSia6I4sssQwyK',
        'type': 'Asset',
        'createdAt': '2017-04-26T11:59:25.093Z',
        'updatedAt': '2017-04-26T11:59:27.204Z',
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedCounter': 1,
        'version': 3,
        'publishedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedVersion': 2,
        'firstPublishedAt': '2017-04-26T11:59:27.191Z',
        'publishedAt': '2017-04-26T11:59:27.191Z'
      },
      'fields': {
        'title': {
          'en-US': 'Ernest Hemingway (1950)'
        },
        'description': {
          'en-US': 'Hemingway in the cabin of his boat Pilar, off the coast of Cuba'
        },
        'file': {
          'en-US': {
            'url': '//images.contentful.com/uvc269yunsnm/3S1ngcWajSia6I4sssQwyK/ae7d489e40bccdfeae6463245ddba725/Ernest_Hemingway_1950.jpg',
            'details': {
              'size': 2290561,
              'image': {
                'width': 2940,
                'height': 2934
              }
            },
            'fileName': 'Ernest_Hemingway_1950.jpg',
            'contentType': 'image/jpeg'
          }
        }
      }
    },
    {
      'sys': {
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'id': '2xA3oKlZTuQ0Wgs2Wm2Mkk',
        'type': 'Asset',
        'createdAt': '2017-04-26T11:59:25.509Z',
        'updatedAt': '2017-04-26T11:59:27.365Z',
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedCounter': 1,
        'version': 3,
        'publishedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'publishedVersion': 2,
        'firstPublishedAt': '2017-04-26T11:59:27.343Z',
        'publishedAt': '2017-04-26T11:59:27.343Z'
      },
      'fields': {
        'title': {
          'en-US': 'Mike Springer'
        },
        'file': {
          'en-US': {
            'url': '//images.contentful.com/uvc269yunsnm/2xA3oKlZTuQ0Wgs2Wm2Mkk/206c69b885422cbc6fc3daca080da7ff/kenchoong.jpeg',
            'details': {
              'size': 3559,
              'image': {
                'width': 200,
                'height': 200
              }
            },
            'fileName': 'kenchoong.jpeg',
            'contentType': 'image/jpeg'
          }
        }
      }
    }
  ],
  'locales': [
    {
      'name': 'U.S. English',
      'code': 'en-US',
      'fallbackCode': null,
      'default': true,
      'contentManagementApi': true,
      'contentDeliveryApi': true,
      'optional': false,
      'sys': {
        'type': 'Locale',
        'id': '5rctuavY58xHruV338jmZC',
        'version': 0,
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'createdAt': '2017-04-26T11:59:17Z',
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedAt': '2017-04-26T11:59:17Z'
      }
    }
  ],
  'webhooks': [],
  'roles': [
    {
      'name': 'Author',
      'description': 'Allows editing of content',
      'policies': [
        {
          'effect': 'allow',
          'actions': [
            'create'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Entry'
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'read'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Entry'
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'update'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Entry'
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'create'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Asset'
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'read'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Asset'
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'update'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Asset'
                ]
              }
            ]
          }
        }
      ],
      'permissions': {
        'ContentModel': [
          'read'
        ],
        'Settings': [],
        'ContentDelivery': []
      },
      'sys': {
        'type': 'Role',
        'id': '5rdGGzR1e2WEoe1WmVNUss',
        'version': 0,
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'createdAt': '2017-04-26T11:59:17Z',
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedAt': '2017-04-26T11:59:17Z'
      }
    },
    {
      'name': 'Developer',
      'description': 'Allows reading Entries and managing API Keys',
      'policies': [
        {
          'effect': 'allow',
          'actions': [
            'read'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Entry'
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'read'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Asset'
                ]
              }
            ]
          }
        }
      ],
      'permissions': {
        'ContentModel': [
          'read'
        ],
        'Settings': [],
        'ContentDelivery': 'all'
      },
      'sys': {
        'type': 'Role',
        'id': '5reTtGkFAyS3LYxQnZLY8Q',
        'version': 0,
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'createdAt': '2017-04-26T11:59:17Z',
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedAt': '2017-04-26T11:59:17Z'
      }
    },
    {
      'name': 'Editor',
      'description': 'Allows editing, publishing and archiving of content',
      'policies': [
        {
          'effect': 'allow',
          'actions': 'all',
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Entry'
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': 'all',
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Asset'
                ]
              }
            ]
          }
        }
      ],
      'permissions': {
        'ContentModel': [
          'read'
        ],
        'Settings': [],
        'ContentDelivery': []
      },
      'sys': {
        'type': 'Role',
        'id': '5rfOaP63A0Rc8RGXtPe1d2',
        'version': 0,
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'createdAt': '2017-04-26T11:59:17Z',
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedAt': '2017-04-26T11:59:17Z'
      }
    },
    {
      'name': 'Freelancer',
      'description': 'Allows only editing of content they created themselves',
      'policies': [
        {
          'effect': 'allow',
          'actions': [
            'create'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Entry'
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'create'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Asset'
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'read'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Entry'
                ]
              },
              {
                'equals': [
                  {
                    'doc': 'sys.createdBy.sys.id'
                  },
                  'User.current()'
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'update'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Entry'
                ]
              },
              {
                'equals': [
                  {
                    'doc': 'sys.createdBy.sys.id'
                  },
                  'User.current()'
                ]
              },
              {
                'paths': [
                  {
                    'doc': 'fields.%.%'
                  }
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'delete'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Entry'
                ]
              },
              {
                'equals': [
                  {
                    'doc': 'sys.createdBy.sys.id'
                  },
                  'User.current()'
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'read'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Asset'
                ]
              },
              {
                'equals': [
                  {
                    'doc': 'sys.createdBy.sys.id'
                  },
                  'User.current()'
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'update'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Asset'
                ]
              },
              {
                'equals': [
                  {
                    'doc': 'sys.createdBy.sys.id'
                  },
                  'User.current()'
                ]
              },
              {
                'paths': [
                  {
                    'doc': 'fields.%.%'
                  }
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'delete'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Asset'
                ]
              },
              {
                'equals': [
                  {
                    'doc': 'sys.createdBy.sys.id'
                  },
                  'User.current()'
                ]
              }
            ]
          }
        }
      ],
      'permissions': {
        'ContentModel': [
          'read'
        ],
        'Settings': [],
        'ContentDelivery': []
      },
      'sys': {
        'type': 'Role',
        'id': '5rgQZtxDnfGdJKeF83UOra',
        'version': 0,
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'createdAt': '2017-04-26T11:59:17Z',
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedAt': '2017-04-26T11:59:17Z'
      }
    },
    {
      'name': 'Translator 1',
      'description': 'Allows editing of localized fields in the specified language',
      'policies': [
        {
          'effect': 'allow',
          'actions': [
            'read'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Entry'
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'read'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Asset'
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'update'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Entry'
                ]
              },
              {
                'paths': [
                  {
                    'doc': 'fields.%.%'
                  }
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'update'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Asset'
                ]
              },
              {
                'paths': [
                  {
                    'doc': 'fields.%.%'
                  }
                ]
              }
            ]
          }
        }
      ],
      'permissions': {
        'ContentModel': [
          'read'
        ],
        'Settings': [],
        'ContentDelivery': []
      },
      'sys': {
        'type': 'Role',
        'id': '5ri7pKe4Xdcz8JAhnsmkGw',
        'version': 0,
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'createdAt': '2017-04-26T11:59:17Z',
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedAt': '2017-04-26T11:59:17Z'
      }
    },
    {
      'name': 'Translator 2',
      'description': 'Allows editing of localized fields in the specified language',
      'policies': [
        {
          'effect': 'allow',
          'actions': [
            'read'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Entry'
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'read'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Asset'
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'update'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Entry'
                ]
              },
              {
                'paths': [
                  {
                    'doc': 'fields.%.%'
                  }
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'update'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Asset'
                ]
              },
              {
                'paths': [
                  {
                    'doc': 'fields.%.%'
                  }
                ]
              }
            ]
          }
        }
      ],
      'permissions': {
        'ContentModel': [
          'read'
        ],
        'Settings': [],
        'ContentDelivery': []
      },
      'sys': {
        'type': 'Role',
        'id': '5rjfI4DHqHrcj8MruoGXRq',
        'version': 0,
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'createdAt': '2017-04-26T11:59:17Z',
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedAt': '2017-04-26T11:59:17Z'
      }
    },
    {
      'name': 'Translator 3',
      'description': 'Allows editing of localized fields in the specified language',
      'policies': [
        {
          'effect': 'allow',
          'actions': [
            'read'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Entry'
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'read'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Asset'
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'update'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Entry'
                ]
              },
              {
                'paths': [
                  {
                    'doc': 'fields.%.%'
                  }
                ]
              }
            ]
          }
        },
        {
          'effect': 'allow',
          'actions': [
            'update'
          ],
          'constraint': {
            'and': [
              {
                'equals': [
                  {
                    'doc': 'sys.type'
                  },
                  'Asset'
                ]
              },
              {
                'paths': [
                  {
                    'doc': 'fields.%.%'
                  }
                ]
              }
            ]
          }
        }
      ],
      'permissions': {
        'ContentModel': [
          'read'
        ],
        'Settings': [],
        'ContentDelivery': []
      },
      'sys': {
        'type': 'Role',
        'id': '5rknMfyoXARG9Z25pOcQXi',
        'version': 0,
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'createdAt': '2017-04-26T11:59:17Z',
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'updatedAt': '2017-04-26T11:59:17Z'
      }
    }
  ],
  'editorInterfaces': [
    {
      'controls': [
        {
          'fieldId': 'name',
          'widgetId': 'singleLine'
        },
        {
          'fieldId': 'website',
          'widgetId': 'urlEditor'
        },
        {
          'fieldId': 'profilePhoto',
          'widgetId': 'assetLinkEditor'
        },
        {
          'fieldId': 'biography',
          'widgetId': 'markdown'
        },
        {
          'fieldId': 'createdEntries',
          'widgetId': 'entryCardsEditor',
          'settings': {
            'bulkEditing': false
          }
        }
      ],
      'sys': {
        'id': 'default',
        'type': 'EditorInterface',
        'version': 2,
        'createdAt': '2017-04-26T11:59:23.494Z',
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'contentType': {
          'sys': {
            'type': 'Link',
            'linkType': 'ContentType',
            'id': '1kUEViTN4EmGiEaaeC6ouY'
          }
        },
        'updatedAt': '2017-04-26T11:59:24.118Z',
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        }
      }
    },
    {
      'controls': [
        {
          'fieldId': 'title',
          'widgetId': 'singleLine'
        },
        {
          'fieldId': 'slug',
          'widgetId': 'slugEditor',
          'settings': {
            'helpText': 'The slug is auto-generated based on the entry title'
          }
        },
        {
          'fieldId': 'author',
          'widgetId': 'entryCardsEditor'
        },
        {
          'fieldId': 'body',
          'widgetId': 'markdown'
        },
        {
          'fieldId': 'category',
          'widgetId': 'entryLinksEditor'
        },
        {
          'fieldId': 'tags',
          'widgetId': 'listInput'
        },
        {
          'fieldId': 'featuredImage',
          'widgetId': 'assetLinkEditor'
        },
        {
          'fieldId': 'date',
          'widgetId': 'datePicker',
          'settings': {
            'format': 'dateonly',
            'ampm': '24'
          }
        },
        {
          'fieldId': 'comments',
          'widgetId': 'radio'
        }
      ],
      'sys': {
        'id': 'default',
        'type': 'EditorInterface',
        'version': 2,
        'createdAt': '2017-04-26T11:59:23.478Z',
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'contentType': {
          'sys': {
            'type': 'Link',
            'linkType': 'ContentType',
            'id': '2wKn6yEnZewu2SCCkus4as'
          }
        },
        'updatedAt': '2017-04-26T11:59:24.108Z',
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        }
      }
    },
    {
      'controls': [
        {
          'fieldId': 'title',
          'widgetId': 'singleLine'
        },
        {
          'fieldId': 'shortDescription',
          'widgetId': 'multipleLine'
        },
        {
          'fieldId': 'icon',
          'widgetId': 'assetLinkEditor'
        }
      ],
      'sys': {
        'id': 'default',
        'type': 'EditorInterface',
        'version': 2,
        'createdAt': '2017-04-26T11:59:23.532Z',
        'createdBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        },
        'space': {
          'sys': {
            'type': 'Link',
            'linkType': 'Space',
            'id': 'uvc269yunsnm'
          }
        },
        'contentType': {
          'sys': {
            'type': 'Link',
            'linkType': 'ContentType',
            'id': '5KMiN6YPvi42icqAUQMCQe'
          }
        },
        'updatedAt': '2017-04-26T11:59:24.066Z',
        'updatedBy': {
          'sys': {
            'type': 'Link',
            'linkType': 'User',
            'id': '6lLQmABUWbGOsBJ8pMV4vI'
          }
        }
      }
    }
  ]
}
