'use strict';
module.exports = (sequelize, Sequelize) => {
  
  const CommentModel = sequelize.define('CommentModel', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      cookbookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      },
      content: {
        type: Sequelize.STRING(1000),
        allowNull: false,
        defaultValue: ''
      },
      createdIpAt: {
        type: Sequelize.CHAR(15),
        allowNull: false,
        defaultValue: ''
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
  }, {
     freezeTableName: true,      
      tableName: 'comment',       
      timestamps: false 
  });
  return CommentModel;
};